package com.myProjects.mindWeave;

import com.myProjects.mindWeave.services.StreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class StreakScheduler {

    @Autowired
    private StreakService streakService; // Autowire your StreakService

    // This method will run once every day at 12:00 AM (midnight)
    // You can adjust the cron expression as needed.
    // Cron expression format: second minute hour day-of-month month day-of-week
    @Scheduled(cron = "0 0 0 * * *") // Runs every day at midnight (00:00:00)
    public void dailyStreakUpdate() {
        System.out.println("Running daily streak update at " + java.time.LocalDateTime.now());
        streakService.checkAndResetDailyStreaks();
        System.out.println("Daily streak update finished.");
    }
}