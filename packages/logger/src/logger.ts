export const logger = {
    info(message: string) {
        console.log(`[INFO] ${message}`);
    },

    error(message: string) {
        console.log(`[ERROR] ${message}`);
    },

    warn(message: string) {
        console.log(`[WARN] ${message}`);
    }

}