import AWS from 'aws-sdk';
const s3 = new AWS.S3();

export default class ImagesController {
  static async getImage(request, response) {
    const { imageId } = request.params;
    const readStream = getFileStream(imageId);
    readStream.pipe(response);
  }
}

export function uploadFile(file) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${Date.now().toString()}-${file.originalname.replace(/\s/g, '-')}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  return s3.upload(params).promise();
}

function getFileStream(fileKey) {
  const params = {
    Key: fileKey,
    Bucket: process.env.AWS_S3_BUCKET,
  };
  return s3.getObject(params).createReadStream();
}
