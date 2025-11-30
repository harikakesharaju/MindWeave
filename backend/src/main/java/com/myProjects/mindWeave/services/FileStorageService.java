package com.myProjects.mindWeave.services;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object; // Needed for retrieval
import com.amazonaws.services.s3.model.S3ObjectInputStream; // Needed for retrieval
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private AmazonS3 s3Client; // Injected from the AwsS3Config

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    // --- UPLOAD LOGIC ---
    public String storeFile(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            return null; 
        }
        
        // Use a folder structure inside the bucket for organization
        String fileKey = "posts/" + userId + "/" + UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            s3Client.putObject(
                bucketName,
                fileKey, 
                file.getInputStream(),
                metadata
            );
            
            // Return the key to be saved in the database
            return fileKey;

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3.", e);
        }
    }

    // --- RETRIEVAL LOGIC ---
    public Resource loadFileAsResource(String fileKey) {
        try {
            S3Object s3Object = s3Client.getObject(bucketName, fileKey);
            S3ObjectInputStream inputStream = s3Object.getObjectContent();
            return new InputStreamResource(inputStream);
        } catch (Exception e) {
            throw new RuntimeException("File not found in S3: " + fileKey, e);
        }
    }
}