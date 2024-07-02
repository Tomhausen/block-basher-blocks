namespace SpriteKind {
    export const Cursor = SpriteKind.create()
    export const Effect = SpriteKind.create()
    export const Path = SpriteKind.create()
    export const Line = SpriteKind.create()
    export const Randomiser = SpriteKind.create()
}
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Randomiser, function (sprite, otherSprite) {
    angle = spriteutils.degreesToRadians(randint(1, 360))
    spriteutils.setVelocityAtAngle(sprite, angle, proj_speed)
    spriteutils.placeAngleFrom(
    sprite,
    angle,
    5,
    otherSprite
    )
})
function make_lives_text (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    block_life = tiles.readDataNumber(location, "life")
    lives_text = textsprite.create(convertToText(block_life))
    tiles.placeOnTile(lives_text, location)
    tiles.setDataSprite(location, "text", lives_text)
}
function spawn_row () {
    for (let col = 0; col <= 9; col++) {
        if (randint(1, 5) > 1) {
            spawn_block(col, 0)
        } else if (randint(1, 5) == 1) {
            spawn_bonus_ball(col, 0)
        } else if (randint(1, 5) == 1) {
            spawn_special_block(col, 0)
        } else if (randint(1, 5) == 1) {
            spawn_unbreakable_block(col, 0)
        } else if (randint(1, 5) == 1) {
            spawn_randomiser(col, 0)
        }
    }
    music.knock.play()
}
function horizontal_destroyer_hit (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    for (let value of tilesAdvanced.getAllTilesWhereWallIs(true)) {
        if (value.row == location.row) {
            block_damage(location.column, location.row)
            line_sprite = sprites.create(image.create(160, 2), SpriteKind.Line)
            line_sprite.image.fill(9)
            line_sprite.setPosition(80, value.y)
            line_sprite.lifespan = 500
        }
    }
}
function move_row () {
    all_blocks = tilesAdvanced.getAllTilesWhereWallIs(true)
    all_blocks.reverse()
    for (let location of all_blocks) {
        if (location.bottom > ghost.top - 16) {
            if (tiles.tileAtLocationEquals(location, myTiles.tile4)) {
                tiles.setTileAt(location, myTiles.transparency16)
                tiles.setWallAt(location, false)
                continue;
            }
            game.over(false)
        }
        move_block(location.column, location.row)
    }
    for (let value of sprites.allOfKind(SpriteKind.Food)) {
        value.y += 16
    }
    for (let value of sprites.allOfKind(SpriteKind.Randomiser)) {
        value.y += 16
    }
}
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Food, function (sprite, otherSprite) {
    proj_count += 1
    sprites.destroy(otherSprite)
})
function fire () {
    fire_angle = spriteutils.angleFrom(ghost, pointer)
    for (let index = 0; index < proj_count; index++) {
        proj = sprites.create(assets.image`projectile`, SpriteKind.Projectile)
        proj.setPosition(ghost.x, ghost.y)
        proj.setBounceOnWall(true)
        spriteutils.setVelocityAtAngle(proj, fire_angle, proj_speed)
        if (one_shot_active) {
            proj.startEffect(effects.fire)
        }
        pause(50)
    }
}
scene.onHitWall(SpriteKind.Projectile, function (proj, location) {
    if (tiles.tileAtLocationEquals(location, myTiles.tile2)) {
        horizontal_destroyer_hit(location.column, location.row)
    }
    if (tiles.tileAtLocationEquals(location, myTiles.tile3)) {
        vertical_destroyer_hit(location.column, location.row)
    }
    if (tiles.tileAtLocationEquals(location, myTiles.tile1)) {
        block_damage(location.column, location.row)
    }
    if (proj.y > ghost.y) {
        if (sprites.allOfKind(SpriteKind.Projectile).length == proj_count) {
            ghost.x = proj.x
        }
        proj.destroy()
    }
})
browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x, y) {
    draw_path = true
})
function spawn_special_block (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    if (randint(1, 2) == 1) {
        tiles.setTileAt(location, myTiles.tile2)
    } else {
        tiles.setTileAt(location, myTiles.tile3)
    }
    tiles.setWallAt(location, true)
    block_life = lives + randint(-2, 2)
    tiles.setDataNumber(location, "life", block_life)
    make_lives_text(location.column, location.row)
}
function make_power_up_bar () {
    one_shot_active = false
    power_up_bar = statusbars.create(160, 2, StatusBarKind.Magic)
    power_up_bar.bottom = 120
    power_up_bar.value = 0
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (power_up_bar.value >= power_up_bar.max) {
        one_shot_active = true
        power_up_bar.value = 0
    }
})
function spawn_unbreakable_block (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    tiles.setTileAt(location, myTiles.tile4)
    tiles.setWallAt(location, true)
}
function cycle_blocks () {
    move_row()
    spawn_row()
}
function setup_vars () {
    proj_count = 10
    proj_speed = 200
    lives = 3
    draw_path = false
}
function spawn_block (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    tiles.setTileAt(location, myTiles.tile1)
    tiles.setWallAt(location, true)
    block_life = lives + randint(-2, 2)
    tiles.setDataNumber(location, "life", block_life)
    make_lives_text(location.column, location.row)
}
function path () {
    aim_sprite.setPosition(ghost.x, ghost.y)
    direction = spriteutils.angleFrom(ghost, pointer)
    x_vector = Math.cos(direction)
    y_vector = Math.sin(direction)
    dot = image.create(2, 2)
    dot.fill(1)
    for (let index = 0; index < 10; index++) {
        dot_sprite = sprites.create(dot, SpriteKind.Path)
        dot_sprite.setPosition(aim_sprite.x, aim_sprite.y)
        for (let index = 0; index < 15; index++) {
            aim_sprite.x += x_vector
            if (tiles.tileAtLocationIsWall(aim_sprite.tilemapLocation())) {
                x_vector = x_vector * -1
                aim_sprite.x += x_vector
            }
            aim_sprite.y += y_vector
            if (tiles.tileAtLocationIsWall(aim_sprite.tilemapLocation())) {
                y_vector = y_vector * -1
                aim_sprite.y += y_vector
            }
        }
    }
}
function spawn_randomiser (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    randomiser_sprite = sprites.create(assets.image`randomiser`, SpriteKind.Randomiser)
    tiles.placeOnTile(randomiser_sprite, location)
    randomiser_sprite.setFlag(SpriteFlag.AutoDestroy, true)
}
function move_block (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    new_location = tiles.getTileLocation(col, row + 1)
    block_image = tiles.tileImageAtLocation(location)
    tiles.setTileAt(new_location, block_image)
    tiles.setWallAt(new_location, true)
    tiles.setTileAt(location, img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `)
    tiles.setWallAt(location, false)
    tiles.moveData(location, new_location, true)
}
function setup () {
    music.setVolume(60)
    tiles.setCurrentTilemap(tilemap`level`)
    for (let index = 0; index < 3; index++) {
        cycle_blocks()
    }
}
function block_damage (col: number, row: number) {
    if (tiles.tileAtLocationEquals(location, myTiles.tile4)) {
        return
    }
    location = tiles.getTileLocation(col, row)
    new_life = tiles.readDataNumber(location, "life") - 1
    sprites.destroy(tiles.readDataSprite(location, "text"))
    if (new_life < 1 || one_shot_active) {
        tiles.setTileAt(location, img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            `)
        tiles.setWallAt(location, false)
        info.changeScoreBy(10)
        scene.cameraShake(4, 500)
        music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.UntilDone)
    } else {
        tiles.setDataNumber(location, "life", new_life)
        make_lives_text(location.column, location.row)
        music.play(music.melodyPlayable(music.footstep), music.PlaybackMode.UntilDone)
        effect_sprite = sprites.create(image.create(16, 16), SpriteKind.Effect)
        effect_sprite.image.fill(2)
        tiles.placeOnTile(effect_sprite, location)
        effect_sprite.setFlag(SpriteFlag.Invisible, true)
        effect_sprite.startEffect(effects.ashes, 200)
        power_up_bar.value += 1
    }
}
function make_sprites () {
    ghost = sprites.create(assets.image`ghost`, SpriteKind.Player)
    ghost.bottom = 120
    ghost.setStayInScreen(true)
    pointer = sprites.create(image.create(1, 1), SpriteKind.Cursor)
    pointer.image.fill(1)
    pointer.setFlag(SpriteFlag.Invisible, true)
}
function setup_aim_sprite () {
    aim_sprite = sprites.create(image.create(2, 2), 0)
    aim_sprite.image.fill(1)
    aim_sprite.setFlag(SpriteFlag.GhostThroughWalls, true)
    aim_sprite.z = -1
    aim_sprite.setFlag(SpriteFlag.Invisible, true)
}
browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Released, function (x, y) {
    draw_path = false
    if (sprites.allOfKind(SpriteKind.Projectile).length < 1) {
        timer.background(function () {
            fire()
        })
        animation.runImageAnimation(
        ghost,
        assets.animation`ghost throw`,
        100,
        false
        )
    }
})
sprites.onDestroyed(SpriteKind.Projectile, function (sprite) {
    if (tiles.getTilesByType(myTiles.tile1).length < 1) {
        game.over(true)
    }
    if (sprites.allOfKind(SpriteKind.Projectile).length < 1) {
        one_shot_active = false
        if (randint(1, 5) == 1) {
            lives += 1
        }
        cycle_blocks()
    }
})
function vertical_destroyer_hit (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    for (let value of tilesAdvanced.getAllTilesWhereWallIs(true)) {
        if (value.column == location.column) {
            block_damage(location.column, location.row)
            line_sprite = sprites.create(image.create(2, 120), SpriteKind.Line)
            line_sprite.image.fill(9)
            line_sprite.setPosition(value.x, 60)
            line_sprite.lifespan = 500
        }
    }
}
function spawn_bonus_ball (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    bonus_ball = sprites.create(assets.image`bonus`, SpriteKind.Food)
    tiles.placeOnTile(bonus_ball, location)
    bonus_ball.setFlag(SpriteFlag.AutoDestroy, true)
}
let bonus_ball: Sprite = null
let effect_sprite: Sprite = null
let new_life = 0
let block_image: Image = null
let new_location: tiles.Location = null
let randomiser_sprite: Sprite = null
let dot_sprite: Sprite = null
let dot: Image = null
let y_vector = 0
let x_vector = 0
let direction = 0
let aim_sprite: Sprite = null
let power_up_bar: StatusBarSprite = null
let lives = 0
let draw_path = false
let one_shot_active = false
let proj: Sprite = null
let pointer: Sprite = null
let fire_angle = 0
let proj_count = 0
let ghost: Sprite = null
let all_blocks: tiles.Location[] = []
let line_sprite: Sprite = null
let lives_text: TextSprite = null
let block_life = 0
let location: tiles.Location = null
let proj_speed = 0
let angle = 0
setup_vars()
make_sprites()
setup_aim_sprite()
setup()
make_power_up_bar()
game.onUpdate(function () {
    pointer.x = browserEvents.getMouseCameraX()
    pointer.y = browserEvents.getMouseCameraY()
    if (pointer.y >= ghost.y - 5) {
        pointer.y = ghost.y - 5
    }
    if (sprites.allOfKind(SpriteKind.Path).length > 0) {
        sprites.destroyAllSpritesOfKind(SpriteKind.Path)
    }
    if (draw_path) {
        path()
    }
})
