package com.project3.server.model;

import java.time.LocalTime;

/**
 * This is a model class that represents a happy hour configuration for a single day
 */
public class HappyHour {
    private String day;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double percentOff;

    /**
     * Constructs a HappyHour with all fields
     * @param day the day of the week
     * @param startTime the start time of happy hour
     * @param endTime the end time of happy hour
     * @param percentOff the discount percentage as a decimal (e.g. 0.25 for 25%)
     */
    public HappyHour(String day, LocalTime startTime, LocalTime endTime, Double percentOff) {
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.percentOff = percentOff;
    }

    /**
     * Gets the day of the week
     * @return String for the day of the week
     */
    public String getDay() {
        return day;
    }

    /**
     * Sets the day of the week
     * @param day the day of the week to be set
     */
    public void setDay(String day) {
        this.day = day;
    }

    /**
     * Gets the start time of happy hour
     * @return LocalTime for the start time
     */
    public LocalTime getStartTime() {
        return startTime;
    }

    /**
     * Sets the start time of happy hour
     * @param startTime the start time to be set
     */
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    /**
     * Gets the end time of happy hour
     * @return LocalTime for the end time
     */
    public LocalTime getEndTime() {
        return endTime;
    }

    /**
     * Sets the end time of happy hour
     * @param endTime the end time to be set
     */
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    /**
     * Gets the discount percentage as a decimal
     * @return Double for the percent off (e.g. 0.25 for 25%), or null if not set
     */
    public Double getPercentOff() {
        return percentOff;
    }

    /**
     * Sets the discount percentage as a decimal
     * @param percentOff the percent off to be set (e.g. 0.25 for 25%)
     */
    public void setPercentOff(Double percentOff) {
        this.percentOff = percentOff;
    }
}