import { clerkClient } from "@clerk/nextjs/server"

const authAdmin = async (userId) => {
    if (!userId) return false

    try {
        console.log('authAdmin: check start', { userId })
        const adminEnv = process.env.ADMIN_EMAIL || ""
        const adminEmails = adminEnv.split(',').map(s => s.trim()).filter(Boolean)
        console.log('authAdmin: adminEmails', adminEmails)
        // Support different clerkClient shapes (some SDK versions expose users, others expose getUser,
        // and some environments may export a factory function)
        console.log('authAdmin: clerkClient type', typeof clerkClient)
        console.log('authAdmin: clerkClient.users', !!(clerkClient && clerkClient.users))
        console.log('authAdmin: clerkClient.getUser', typeof (clerkClient && clerkClient.getUser))
        let user = null

        // If clerkClient is a function (factory), call it to get the client object
        let clientObj = clerkClient
        if (typeof clerkClient === 'function') {
            try {
                clientObj = await clerkClient()
                console.log('authAdmin: obtained client from clerkClient()')
            } catch (e) {
                console.warn('authAdmin: calling clerkClient() failed', e)
            }
        }

        if (clientObj && typeof clientObj === 'object') {
            if (clientObj.users && typeof clientObj.users.getUser === 'function') {
                user = await clientObj.users.getUser(userId)
            } else if (typeof clientObj.getUser === 'function') {
                user = await clientObj.getUser(userId)
            }
        }

        if (!user) {
            console.error('authAdmin: clerkClient did not return a user for', userId)
            return false
        }

        const userEmail = user?.emailAddresses?.[0]?.emailAddress
        console.log('authAdmin: userEmail', userEmail)
        if (!userEmail) return false

        return adminEmails.includes(userEmail)
    } catch (error) {
        console.error('authAdmin error:', error)
        return false
    }
}

export default authAdmin