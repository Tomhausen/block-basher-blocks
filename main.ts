namespace SpriteKind {
    export const cursor = SpriteKind.create()
}
function aim () {
    angle = spriteutils.radiansToDegrees(spriteutils.angleFrom(ghost, pointer))
    transformSprites.rotateSprite(aim_sprite, angle)
}
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
        }
    }
    music.knock.play()
}
function move_row () {
    all_blocks = tilesAdvanced.getAllTilesWhereWallIs(true)
    all_blocks.reverse()
    for (let location of all_blocks) {
        if (location.bottom > ghost.top - 16) {
            game.over(false)
        }
        move_block(location.column, location.row)
    }
}
function fire () {
    fire_angle = spriteutils.angleFrom(ghost, pointer)
    for (let index = 0; index < proj_count; index++) {
        proj = sprites.create(assets.image`projectile`, SpriteKind.Projectile)
        proj.setPosition(ghost.x, ghost.y)
        proj.setBounceOnWall(true)
        spriteutils.setVelocityAtAngle(proj, fire_angle, proj_speed)
        pause(50)
    }
}
scene.onHitWall(SpriteKind.Projectile, function (proj, location) {
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
    aim_sprite.setFlag(SpriteFlag.Invisible, false)
    aim_sprite.x = ghost.x
    aim_sprite.y = ghost.y
})
function cycle_blocks () {
    move_row()
    spawn_row()
}
function setup_vars () {
    proj_count = 10
    proj_speed = 200
    lives = 3
}
function spawn_block (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    tiles.setTileAt(location, myTiles.tile1)
    tiles.setWallAt(location, true)
    block_life = lives + randint(-2, 2)
    tiles.setDataNumber(location, "life", block_life)
    make_lives_text(location.column, location.row)
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
    music.setVolume(20)
    tiles.setCurrentTilemap(tilemap`level`)
    for (let index = 0; index < 3; index++) {
        cycle_blocks()
    }
}
function block_damage (col: number, row: number) {
    location = tiles.getTileLocation(col, row)
    new_life = tiles.readDataNumber(location, "life") - 1
    sprites.destroy(tiles.readDataSprite(location, "text"))
    if (new_life < 1) {
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
    } else {
        tiles.setDataNumber(location, "life", new_life)
        make_lives_text(location.column, location.row)
    }
}
function make_sprites () {
    ghost = sprites.create(assets.image`ghost`, SpriteKind.Player)
    ghost.bottom = 120
    ghost.setStayInScreen(true)
    pointer = sprites.create(image.create(1, 1), SpriteKind.cursor)
    pointer.image.fill(1)
    pointer.setFlag(SpriteFlag.Invisible, true)
}
function setup_aim_sprite () {
    aim_sprite = sprites.create(image.create(150, 150), 0)
    aim_sprite.image.fillRect(74, 74, 75, 2, 2)
    aim_sprite.z = -1
    aim_sprite.setFlag(SpriteFlag.Invisible, true)
}
browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Released, function (x, y) {
    aim_sprite.setFlag(SpriteFlag.Invisible, true)
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
        cycle_blocks()
    }
})
let new_life = 0
let block_image: Image = null
let new_location: tiles.Location = null
let lives = 0
let proj_speed = 0
let proj: Sprite = null
let proj_count = 0
let fire_angle = 0
let all_blocks: tiles.Location[] = []
let lives_text: TextSprite = null
let block_life = 0
let location: tiles.Location = null
let aim_sprite: Sprite = null
let pointer: Sprite = null
let ghost: Sprite = null
let angle = 0
setup_vars()
make_sprites()
setup_aim_sprite()
setup()
game.onUpdate(function () {
    pointer.x = browserEvents.getMouseCameraX()
    pointer.y = browserEvents.getMouseCameraY()
    if (pointer.y >= ghost.y - 5) {
        pointer.y = ghost.y - 5
    }
    aim()
})
