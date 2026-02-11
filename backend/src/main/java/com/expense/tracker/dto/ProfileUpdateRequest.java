package com.expense.tracker.dto;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {
    @Size(min = 1, max = 255)
    private String name;
    @Size(max = 255)
    private String contact;
    @Size(max = 1000)
    private String bio;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
