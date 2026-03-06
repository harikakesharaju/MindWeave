package com.myProjects.mindWeave;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.myProjects.mindWeave.services.StreakService;

@Component
public class StreakScheduler {

    @Autowired
    private StreakService streakService;

    @Scheduled(cron = "0 0 0 * * *")
    public void runDailyStreakCheck() {

        System.out.println("RUNNING STREAK JOB");

        streakService.checkAndResetDailyStreaks();
    }
}