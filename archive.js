import fs from 'fs/promises'

class Archive {
    static async writeFile(file, content) {
        try {
            await fs.writeFile(file, content)
        } catch (error) {
            console.error(error)
        }
    }

    static async readFile(file) {
        const exists = await Archive.fileExists(file)
        if (exists) {
            try {
                return await fs.readFile(file, { encoding: 'utf8' })
            } catch (error) {
                console.error(error)
            }
        }
    }

    static async fileExists(file) {
        try {
            await fs.access(file)
            return true
        } catch {
            return false
        }
    }
}

export default Archive

