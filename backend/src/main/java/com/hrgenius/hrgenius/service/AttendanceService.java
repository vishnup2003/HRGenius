package com.hrgenius.hrgenius.service;

import com.hrgenius.hrgenius.entity.Attendance;
import com.hrgenius.hrgenius.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Attendance record not found: " + id));
    }

    public List<Attendance> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    public Attendance createAttendance(Attendance attendance) {

        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(
                attendance.getEmployeeId(),
                attendance.getAttendanceDate())) {
            throw new RuntimeException(
                    "Attendance already exists for this employee on this date."
            );
        }

        attendance.setId(null);

        if (attendance.getStatus() == null ||
                attendance.getStatus().isBlank()) {
            attendance.setStatus("Present");
        }

        validateStatus(attendance.getStatus());

        if (attendance.getCheckIn() != null &&
                attendance.getCheckOut() != null &&
                !attendance.getCheckOut().isAfter(attendance.getCheckIn())) {
            throw new IllegalArgumentException(
                    "Check-out time must be after check-in time."
            );
        }

        return attendanceRepository.save(attendance);
    }

    public Attendance updateAttendance(Long id, Attendance updatedAttendance) {

        Attendance existing = getAttendanceById(id);

        existing.setCheckIn(updatedAttendance.getCheckIn());
        existing.setCheckOut(updatedAttendance.getCheckOut());
        existing.setStatus(updatedAttendance.getStatus());
        existing.setRemarks(updatedAttendance.getRemarks());

        validateStatus(existing.getStatus());

        if (existing.getCheckIn() != null &&
                existing.getCheckOut() != null &&
                !existing.getCheckOut().isAfter(existing.getCheckIn())) {
            throw new IllegalArgumentException(
                    "Check-out time must be after check-in time."
            );
        }

        return attendanceRepository.save(existing);
    }

    public Attendance updateAttendanceStatus(Long id, String status) {

        Attendance attendance = getAttendanceById(id);

        validateStatus(status);

        attendance.setStatus(status);

        if (!"Present".equals(status) && !"Half-day".equals(status)) {
            attendance.setCheckIn(null);
            attendance.setCheckOut(null);
        }

        return attendanceRepository.save(attendance);
    }

    public Attendance checkIn(Long id) {

        Attendance attendance = getAttendanceById(id);

        if (!"Present".equals(attendance.getStatus())) {
            throw new IllegalArgumentException(
                    "Only Present employees can check in."
            );
        }

        if (attendance.getCheckIn() != null) {
            throw new IllegalArgumentException("Employee has already checked in.");
        }

        attendance.setCheckIn(LocalTime.now());

        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Long id) {

        Attendance attendance = getAttendanceById(id);

        if (attendance.getCheckIn() == null) {
            throw new IllegalArgumentException(
                    "Employee must check in before checking out."
            );
        }

        if (attendance.getCheckOut() != null) {
            throw new IllegalArgumentException("Employee has already checked out.");
        }

        attendance.setCheckOut(LocalTime.now());

        return attendanceRepository.save(attendance);
    }

    public void deleteAttendance(Long id) {

        Attendance attendance = getAttendanceById(id);

        attendanceRepository.delete(attendance);
    }

    private void validateStatus(String status) {

        if (status == null ||
                !List.of("Present", "Absent", "Half-day", "Leave")
                        .contains(status)) {
            throw new IllegalArgumentException(
                    "Invalid attendance status."
            );
        }
    }
}
