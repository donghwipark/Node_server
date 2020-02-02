const { ADMIN_PASS: adminPass } = process.env

exports.login = (ctx) => {
    const { password } = ctx.request.body
    if(adminPass === password) {
        ctx.body = {
            success: true
        }
        // if successfully logged in change value as true
        ctx.session.logged = true
    } else {
        ctx.body = {
            success: false
        }
        ctx.status = 401 // Unauthorized
    }
}

exports.check = (ctx) => {
    ctx.body = {
        // Set two ! so even there are no value return false as a default
        logged: !!ctx.session.logged
    }
}

exports.logout = (ctx) => {
    ctx.session = null
    ctx.status = 204 // No content
}

