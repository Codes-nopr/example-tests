export default async function configDotenv(): Promise<void> {
    (await import("dotenv")).config();
}
