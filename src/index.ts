import { segmentedDownload } from "./downloader";

const [, , cmd, url, out] = process.argv;

async function main() {
    if (cmd === "download") {
        if (!url || !out) {
            console.error("Usage: swiftdl download <url> <output_filename>");
            process.exit(1);
        }

        await segmentedDownload(url, out);
    } else {
        console.log("Commands:");
        console.log("  download <url> <outputFilename>");
    }
}

main();