package com.project3.server.service;

import com.project3.server.model.HappyHour;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Service
public class HappyHourService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private static final List<String> VALID_DAYS = List.of(
            "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    );

    public List<HappyHour> getHappyHours() throws Exception {
        String sql = """
                SELECT
                    day,
                    start_time,
                    end_time,
                    percent_off
                FROM happy_hour
                ORDER BY ARRAY_POSITION(ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], day)
                """;

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            List<HappyHour> happyHours = new ArrayList<>();

            while (rs.next()) {
                Time startTime = rs.getTime("start_time");
                Time endTime = rs.getTime("end_time");
                happyHours.add(new HappyHour(
                        rs.getString("day"),
                        startTime != null ? startTime.toLocalTime() : null,
                        endTime != null ? endTime.toLocalTime() : null,
                        rs.getObject("percent_off") != null ? rs.getDouble("percent_off") : null
                ));
            }

            return happyHours;
        }
    }

    public HappyHour updateHappyHour(String day, HappyHour happyHour) throws Exception {
        validate(day, happyHour);

        String sql = """
                UPDATE happy_hour
                SET
                    start_time = ?,
                    end_time = ?,
                    percent_off = ?
                WHERE day = ?
                """;

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setObject(1, happyHour.getStartTime() != null ? Time.valueOf(happyHour.getStartTime()) : null);
            ps.setObject(2, happyHour.getEndTime() != null ? Time.valueOf(happyHour.getEndTime()) : null);
            ps.setObject(3, happyHour.getPercentOff());
            ps.setString(4, day.trim().toLowerCase());

            int updated = ps.executeUpdate();

            if (updated == 0) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No happy hour record found for day: " + day
                );
            }

            return happyHour;
        }
    }

    public HappyHour clearHappyHour(String day) throws Exception {
        if (day == null || day.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Day is required.");
        }

        if (!VALID_DAYS.contains(day.trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid day: " + day);
        }

        String sql = """
                UPDATE happy_hour
                SET
                    start_time = NULL,
                    end_time = NULL,
                    percent_off = NULL
                WHERE day = ?
                """;

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, day.trim().toLowerCase());

            int updated = ps.executeUpdate();

            if (updated == 0) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No happy hour record found for day: " + day
                );
            }

            return new HappyHour(day.trim().toLowerCase(), null, null, null);
        }
    }

    private void validate(String day, HappyHour happyHour) {
        if (day == null || day.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Day is required.");
        }

        if (!VALID_DAYS.contains(day.trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid day: " + day);
        }

        if (happyHour == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Happy hour data is required.");
        }

        boolean hasStart = happyHour.getStartTime() != null;
        boolean hasEnd = happyHour.getEndTime() != null;

        if (hasStart != hasEnd) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Both start_time and end_time are required together."
            );
        }

        if (happyHour.getPercentOff() != null &&
                (happyHour.getPercentOff() < 0 || happyHour.getPercentOff() > 1)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "percent_off must be between 0 and 1."
            );
        }
    }
}