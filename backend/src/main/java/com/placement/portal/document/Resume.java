package com.placement.portal.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "resumes")
public class Resume {

    @Id
    private String id;

    private Long studentId;
    private String fileName;
    private String contentType;
    private byte[] fileData;
    private String extractedText;
    private Instant uploadedAt;

    public Resume() {
        this.uploadedAt = Instant.now();
    }

    public Resume(Long studentId, String fileName, String contentType, byte[] fileData, String extractedText) {
        this();
        this.studentId = studentId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileData = fileData;
        this.extractedText = extractedText;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
}
