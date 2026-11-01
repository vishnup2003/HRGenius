package com.hrgenius.hrgenius.repository;

import com.hrgenius.hrgenius.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeId(Long employeeId);

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(
            Long employeeId, LocalDate attendanceDate
    );

    boolean existsByEmployeeIdAndAttendanceDate(
            Long employeeId, LocalDate attendanceDate
    );
}
