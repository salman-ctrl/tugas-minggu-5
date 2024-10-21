import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const logDirectory = path.join(__dirname, 'log'); // Folder log
const logFilePath = path.join(logDirectory, `${new Date().toISOString().replace(/:/g, '-')}.log`);

// Pastikan folder log ada
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Fungsi untuk mencatat log
const log = (message: string) => {
    const timeStamp = new Date().toLocaleString();
    fs.appendFileSync(logFilePath, `[${timeStamp}] ${message}\n`, { encoding: 'utf8' });
};

// Fungsi untuk mengenkripsi file
const encryptFile = async (filePath: string, password: string) => {
    try {
        log(`Mulai mengenkripsi file: ${filePath}`);

        const iv = crypto.randomBytes(16); // Inisialisasi vektor
        const key = crypto.scryptSync(password, 'salt', 32); // Kunci dari password
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv); // Algoritma enkripsi

        const input = fs.createReadStream(filePath);
        const output = fs.createWriteStream(`${filePath}.encrypted`);

        input.pipe(cipher).pipe(output);

        output.on('finish', () => {
            log(`Berhasil mengenkripsi file: ${filePath}`);
        });
    } catch (error) {
        if (error instanceof Error) {
            log(`Error ketika mengenkripsi file: ${error.message}`);
        } else {
            log(`Error ketika mengenkripsi file: ${String(error)}`);
        }
    }
};

// Fungsi untuk mendekripsi file
const decryptFile = async (filePath: string, password: string) => {
    try {
        log(`Mulai mendekripsi file: ${filePath}`);

        const input = fs.createReadStream(filePath);
        const output = fs.createWriteStream(filePath.replace('.encrypted', ''));
        const iv = Buffer.alloc(16); // IV harus sama dengan saat enkripsi

        const key = crypto.scryptSync(password, 'salt', 32); // Kunci dari password
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv); // Algoritma dekripsi

        input.pipe(decipher).pipe(output);

        output.on('finish', () => {
            log(`Berhasil mendekripsi file: ${filePath}`);
        });
    } catch (error) {
        if (error instanceof Error) {
            log(`Error ketika mendekripsi file: ${error.message}`);
        } else {
            log(`Error ketika mendekripsi file: ${String(error)}`);
        }
    }
};

// Fungsi utama
const main = async () => {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.error('Penggunaan: ts-node index.ts <encrypt|decrypt> <filePath> <password>');
        return;
    }

    const [command, filePath, password] = args;

    if (command === 'encrypt') {
        await encryptFile(filePath, password);
    } else if (command === 'decrypt') {
        await decryptFile(filePath, password);
    } else {
        console.error('Perintah tidak valid. Gunakan "encrypt" atau "decrypt".');
    }
};

main();
