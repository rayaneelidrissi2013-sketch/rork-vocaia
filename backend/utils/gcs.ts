import { Storage } from '@google-cloud/storage';

let storageClient: Storage | null = null;

export function initializeGCS() {
  if (storageClient) {
    return storageClient;
  }

  const gcsKeyJson = process.env.GCS_SERVICE_ACCOUNT_KEY;
  
  if (!gcsKeyJson) {
    console.error('GCS_SERVICE_ACCOUNT_KEY environment variable not found');
    throw new Error('GCS configuration missing');
  }

  try {
    const credentials = JSON.parse(gcsKeyJson);
    
    storageClient = new Storage({
      projectId: credentials.project_id,
      credentials,
    });

    console.log('GCS initialized successfully');
    return storageClient;
  } catch (error) {
    console.error('Failed to initialize GCS:', error);
    throw new Error('Failed to initialize Google Cloud Storage');
  }
}

export async function uploadRecordingToGCS(
  audioUrl: string,
  callId: string,
  userId: string
): Promise<string> {
  try {
    const storage = initializeGCS();
    const bucketName = process.env.GCS_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME environment variable not found');
    }

    const bucket = storage.bucket(bucketName);
    
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download recording: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    const fileName = `recordings/${userId}/${callId}.wav`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: 'audio/wav',
        metadata: {
          callId,
          userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    
    console.log(`Recording uploaded to GCS: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw error;
  }
}

export async function deleteRecordingFromGCS(gcsUrl: string): Promise<void> {
  try {
    const storage = initializeGCS();
    const bucketName = process.env.GCS_BUCKET_NAME;
    
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME environment variable not found');
    }

    const url = new URL(gcsUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(2).join('/');

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.delete();
    
    console.log(`Recording deleted from GCS: ${fileName}`);
  } catch (error) {
    console.error('Error deleting from GCS:', error);
    throw error;
  }
}
