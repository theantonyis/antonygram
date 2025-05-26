import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

// Create shared key credential
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

// Create blob service client
const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
);

// Get a reference to the container
const containerClient = blobServiceClient.getContainerClient(containerName);

// Initialize container if it doesn't exist - without specifying public access
const initialize = async () => {
    try {
        // Create container without public access settings
        await containerClient.createIfNotExists();
        console.log(`Container "${containerName}" initialized`);
    } catch (error) {
        console.error("Error initializing container:", error);
    }
};

initialize();

export const uploadFile = async (fileBuffer, fileName, fileType) => {
    const blobName = `${Date.now()}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: fileType }
    });

    return blobName;
};

export const generateSasUrl = async (blobName) => {
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Create SAS token that's valid for 15 minutes
        const startsOn = new Date();
        const expiresOn = new Date(startsOn);
        expiresOn.setMinutes(startsOn.getMinutes() + 15);

        const sasOptions = {
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse("r"), // Read permission
            startsOn,
            expiresOn
        };

        // Generate URL with SAS token
        const sasToken = generateBlobSASQueryParameters(
            sasOptions,
            sharedKeyCredential
        ).toString();

        return `${blockBlobClient.url}?${sasToken}`;
    } catch (error) {
        console.error("Error generating SAS URL:", error);
        throw error;
    }
};
