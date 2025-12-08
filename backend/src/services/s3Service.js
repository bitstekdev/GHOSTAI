const { s3 } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

exports.uploadToS3 = async (buffer, folder, filename, contentType = 'image/png') => {
  const key = `${folder}/${uuidv4()}-${filename}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();

  return {
    key: result.Key,
    url: result.Location,
    bucket: result.Bucket
  };
};

exports.deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };

  await s3.deleteObject(params).promise();
};

exports.getSignedUrl = async (key, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Expires: expiresIn
  };

  return s3.getSignedUrl('getObject', params);
};
