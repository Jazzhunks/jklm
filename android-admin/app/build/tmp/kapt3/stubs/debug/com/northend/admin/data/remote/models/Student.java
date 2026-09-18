package com.northend.admin.data.remote.models;

import com.squareup.moshi.Json;
import com.squareup.moshi.JsonClass;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00006\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0007\n\u0002\u0010\u0006\n\u0002\b\b\n\u0002\u0010 \n\u0002\u0010$\n\u0002\bP\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0002\b\u0086\b\u0018\u00002\u00020\u0001B\u00eb\u0002\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\b\b\u0001\u0010\u0004\u001a\u00020\u0003\u0012\b\b\u0001\u0010\u0005\u001a\u00020\u0003\u0012\b\b\u0001\u0010\u0006\u001a\u00020\u0003\u0012\b\b\u0001\u0010\u0007\u001a\u00020\u0003\u0012\n\b\u0002\u0010\b\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\t\u001a\u0004\u0018\u00010\u0003\u0012\b\b\u0003\u0010\n\u001a\u00020\u000b\u0012\b\b\u0003\u0010\f\u001a\u00020\u000b\u0012\b\b\u0002\u0010\r\u001a\u00020\u000b\u0012\n\b\u0003\u0010\u000e\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u000f\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u0010\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0011\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u0012\u001a\u0004\u0018\u00010\u0003\u0012\u001a\b\u0002\u0010\u0013\u001a\u0014\u0012\u0010\u0012\u000e\u0012\u0004\u0012\u00020\u0003\u0012\u0004\u0012\u00020\u00010\u00150\u0014\u0012\n\b\u0002\u0010\u0016\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0017\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u0018\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0019\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u001a\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u001b\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u001c\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u001d\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u001e\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\u001f\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010 \u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010!\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0003\u0010\"\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010#\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\u0002\u0010$J\t\u0010F\u001a\u00020\u0003H\u00c6\u0003J\t\u0010G\u001a\u00020\u000bH\u00c6\u0003J\u000b\u0010H\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010I\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010J\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010K\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010L\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u001b\u0010M\u001a\u0014\u0012\u0010\u0012\u000e\u0012\u0004\u0012\u00020\u0003\u0012\u0004\u0012\u00020\u00010\u00150\u0014H\u00c6\u0003J\u000b\u0010N\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010O\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010P\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\t\u0010Q\u001a\u00020\u0003H\u00c6\u0003J\u000b\u0010R\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010S\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010T\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010U\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010V\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010W\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010X\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010Y\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010Z\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010[\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\t\u0010\\\u001a\u00020\u0003H\u00c6\u0003J\u000b\u0010]\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\t\u0010^\u001a\u00020\u0003H\u00c6\u0003J\t\u0010_\u001a\u00020\u0003H\u00c6\u0003J\u000b\u0010`\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010a\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\t\u0010b\u001a\u00020\u000bH\u00c6\u0003J\t\u0010c\u001a\u00020\u000bH\u00c6\u0003J\u00f1\u0002\u0010d\u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\b\b\u0003\u0010\u0004\u001a\u00020\u00032\b\b\u0003\u0010\u0005\u001a\u00020\u00032\b\b\u0003\u0010\u0006\u001a\u00020\u00032\b\b\u0003\u0010\u0007\u001a\u00020\u00032\n\b\u0002\u0010\b\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\t\u001a\u0004\u0018\u00010\u00032\b\b\u0003\u0010\n\u001a\u00020\u000b2\b\b\u0003\u0010\f\u001a\u00020\u000b2\b\b\u0002\u0010\r\u001a\u00020\u000b2\n\b\u0003\u0010\u000e\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u000f\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u0010\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0011\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u0012\u001a\u0004\u0018\u00010\u00032\u001a\b\u0002\u0010\u0013\u001a\u0014\u0012\u0010\u0012\u000e\u0012\u0004\u0012\u00020\u0003\u0012\u0004\u0012\u00020\u00010\u00150\u00142\n\b\u0002\u0010\u0016\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0017\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u0018\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0019\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u001a\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u001b\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u001c\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u001d\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u001e\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\u001f\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010 \u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010!\u001a\u0004\u0018\u00010\u00032\n\b\u0003\u0010\"\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010#\u001a\u0004\u0018\u00010\u0003H\u00c6\u0001J\u0013\u0010e\u001a\u00020f2\b\u0010g\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010h\u001a\u00020iH\u00d6\u0001J\t\u0010j\u001a\u00020\u0003H\u00d6\u0001R\u0013\u0010\u0011\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b%\u0010&R\u0013\u0010\u001e\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\'\u0010&R\u0013\u0010\t\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b(\u0010&R\u0013\u0010\u0019\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b)\u0010&R\u0011\u0010\u0007\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b*\u0010&R\u0013\u0010\u001a\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b+\u0010&R\u0013\u0010\u001d\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b,\u0010&R\u0011\u0010\u0005\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b-\u0010&R\u0013\u0010 \u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b.\u0010&R\u0013\u0010\u001f\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b/\u0010&R\u0011\u0010\u0006\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b0\u0010&R\u0011\u0010\r\u001a\u00020\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b1\u00102R\u0013\u0010\u0017\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b3\u0010&R#\u0010\u0013\u001a\u0014\u0012\u0010\u0012\u000e\u0012\u0004\u0012\u00020\u0003\u0012\u0004\u0012\u00020\u00010\u00150\u0014\u00a2\u0006\b\n\u0000\u001a\u0004\b4\u00105R\u0013\u0010\u001b\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b6\u0010&R\u0013\u0010\"\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b7\u0010&R\u0011\u0010\u0004\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b8\u0010&R\u0013\u0010\u0016\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b9\u0010&R\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b:\u0010&R\u0013\u0010!\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b;\u0010&R\u0013\u0010#\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b<\u0010&R\u0013\u0010\u001c\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b=\u0010&R\u0013\u0010\u000f\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b>\u0010&R\u0013\u0010\u0010\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b?\u0010&R\u0013\u0010\u0012\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b@\u0010&R\u0011\u0010\f\u001a\u00020\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\bA\u00102R\u0013\u0010\u0018\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\bB\u0010&R\u0013\u0010\b\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\bC\u0010&R\u0013\u0010\u000e\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\bD\u0010&R\u0011\u0010\n\u001a\u00020\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\bE\u00102\u00a8\u0006k"}, d2 = {"Lcom/northend/admin/data/remote/models/Student;", "", "id", "", "fullName", "contactPhone", "courseId", "branchId", "status", "batch", "totalFee", "", "scholarshipPercent", "discount", "studentNo", "parentName", "parentPhone", "address", "photoUrl", "documents", "", "", "gender", "dob", "schoolInstitute", "board", "category", "emergencyPhone", "parentEmail", "contactEmail", "admissionDate", "courseDuration", "counsellorId", "luid", "enrollmentNumber", "notes", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;DDDLjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/util/List;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", "getAddress", "()Ljava/lang/String;", "getAdmissionDate", "getBatch", "getBoard", "getBranchId", "getCategory", "getContactEmail", "getContactPhone", "getCounsellorId", "getCourseDuration", "getCourseId", "getDiscount", "()D", "getDob", "getDocuments", "()Ljava/util/List;", "getEmergencyPhone", "getEnrollmentNumber", "getFullName", "getGender", "getId", "getLuid", "getNotes", "getParentEmail", "getParentName", "getParentPhone", "getPhotoUrl", "getScholarshipPercent", "getSchoolInstitute", "getStatus", "getStudentNo", "getTotalFee", "component1", "component10", "component11", "component12", "component13", "component14", "component15", "component16", "component17", "component18", "component19", "component2", "component20", "component21", "component22", "component23", "component24", "component25", "component26", "component27", "component28", "component29", "component3", "component30", "component4", "component5", "component6", "component7", "component8", "component9", "copy", "equals", "", "other", "hashCode", "", "toString", "app_debug"})
public final class Student {
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String id = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String fullName = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String contactPhone = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String courseId = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String branchId = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String status = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String batch = null;
    private final double totalFee = 0.0;
    private final double scholarshipPercent = 0.0;
    private final double discount = 0.0;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String studentNo = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String parentName = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String parentPhone = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String address = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String photoUrl = null;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<java.util.Map<java.lang.String, java.lang.Object>> documents = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String gender = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String dob = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String schoolInstitute = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String board = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String category = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String emergencyPhone = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String parentEmail = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String contactEmail = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String admissionDate = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String courseDuration = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String counsellorId = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String luid = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String enrollmentNumber = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String notes = null;
    
    public Student(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @com.squareup.moshi.Json(name = "full_name")
    @org.jetbrains.annotations.NotNull()
    java.lang.String fullName, @com.squareup.moshi.Json(name = "contact_phone")
    @org.jetbrains.annotations.NotNull()
    java.lang.String contactPhone, @com.squareup.moshi.Json(name = "course_id")
    @org.jetbrains.annotations.NotNull()
    java.lang.String courseId, @com.squareup.moshi.Json(name = "branch_id")
    @org.jetbrains.annotations.NotNull()
    java.lang.String branchId, @org.jetbrains.annotations.Nullable()
    java.lang.String status, @org.jetbrains.annotations.Nullable()
    java.lang.String batch, @com.squareup.moshi.Json(name = "total_fee")
    double totalFee, @com.squareup.moshi.Json(name = "scholarship_percent")
    double scholarshipPercent, double discount, @com.squareup.moshi.Json(name = "student_no")
    @org.jetbrains.annotations.Nullable()
    java.lang.String studentNo, @com.squareup.moshi.Json(name = "parent_name")
    @org.jetbrains.annotations.Nullable()
    java.lang.String parentName, @com.squareup.moshi.Json(name = "parent_phone")
    @org.jetbrains.annotations.Nullable()
    java.lang.String parentPhone, @org.jetbrains.annotations.Nullable()
    java.lang.String address, @com.squareup.moshi.Json(name = "photo_url")
    @org.jetbrains.annotations.Nullable()
    java.lang.String photoUrl, @org.jetbrains.annotations.NotNull()
    java.util.List<? extends java.util.Map<java.lang.String, ? extends java.lang.Object>> documents, @org.jetbrains.annotations.Nullable()
    java.lang.String gender, @org.jetbrains.annotations.Nullable()
    java.lang.String dob, @com.squareup.moshi.Json(name = "school_institute")
    @org.jetbrains.annotations.Nullable()
    java.lang.String schoolInstitute, @org.jetbrains.annotations.Nullable()
    java.lang.String board, @org.jetbrains.annotations.Nullable()
    java.lang.String category, @com.squareup.moshi.Json(name = "emergency_phone")
    @org.jetbrains.annotations.Nullable()
    java.lang.String emergencyPhone, @com.squareup.moshi.Json(name = "parent_email")
    @org.jetbrains.annotations.Nullable()
    java.lang.String parentEmail, @com.squareup.moshi.Json(name = "contact_email")
    @org.jetbrains.annotations.Nullable()
    java.lang.String contactEmail, @com.squareup.moshi.Json(name = "admission_date")
    @org.jetbrains.annotations.Nullable()
    java.lang.String admissionDate, @com.squareup.moshi.Json(name = "course_duration")
    @org.jetbrains.annotations.Nullable()
    java.lang.String courseDuration, @com.squareup.moshi.Json(name = "counsellor_id")
    @org.jetbrains.annotations.Nullable()
    java.lang.String counsellorId, @org.jetbrains.annotations.Nullable()
    java.lang.String luid, @com.squareup.moshi.Json(name = "enrollment_number")
    @org.jetbrains.annotations.Nullable()
    java.lang.String enrollmentNumber, @org.jetbrains.annotations.Nullable()
    java.lang.String notes) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getId() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getFullName() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getContactPhone() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getCourseId() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getBranchId() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getStatus() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getBatch() {
        return null;
    }
    
    public final double getTotalFee() {
        return 0.0;
    }
    
    public final double getScholarshipPercent() {
        return 0.0;
    }
    
    public final double getDiscount() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getStudentNo() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getParentName() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getParentPhone() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getAddress() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getPhotoUrl() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.util.Map<java.lang.String, java.lang.Object>> getDocuments() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getGender() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getDob() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getSchoolInstitute() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getBoard() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getCategory() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getEmergencyPhone() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getParentEmail() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getContactEmail() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getAdmissionDate() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getCourseDuration() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getCounsellorId() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getLuid() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getEnrollmentNumber() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getNotes() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component1() {
        return null;
    }
    
    public final double component10() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component11() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component12() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component13() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component14() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component15() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<java.util.Map<java.lang.String, java.lang.Object>> component16() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component17() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component18() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component19() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component2() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component20() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component21() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component22() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component23() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component24() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component25() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component26() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component27() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component28() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component29() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component3() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component30() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component4() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component5() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component6() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component7() {
        return null;
    }
    
    public final double component8() {
        return 0.0;
    }
    
    public final double component9() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.northend.admin.data.remote.models.Student copy(@org.jetbrains.annotations.NotNull()
    java.lang.String id, @com.squareup.moshi.Json(name = "full_name")
    @org.jetbrains.annotations.NotNull()
    java.lang.String fullName, @com.squareup.moshi.Json(name = "contact_phone")
    @org.jetbrains.annotations.NotNull()
    java.lang.String contactPhone, @com.squareup.moshi.Json(name = "course_id")
    @org.jetbrains.annotations.NotNull()
    java.lang.String courseId, @com.squareup.moshi.Json(name = "branch_id")
    @org.jetbrains.annotations.NotNull()
    java.lang.String branchId, @org.jetbrains.annotations.Nullable()
    java.lang.String status, @org.jetbrains.annotations.Nullable()
    java.lang.String batch, @com.squareup.moshi.Json(name = "total_fee")
    double totalFee, @com.squareup.moshi.Json(name = "scholarship_percent")
    double scholarshipPercent, double discount, @com.squareup.moshi.Json(name = "student_no")
    @org.jetbrains.annotations.Nullable()
    java.lang.String studentNo, @com.squareup.moshi.Json(name = "parent_name")
    @org.jetbrains.annotations.Nullable()
    java.lang.String parentName, @com.squareup.moshi.Json(name = "parent_phone")
    @org.jetbrains.annotations.Nullable()
    java.lang.String parentPhone, @org.jetbrains.annotations.Nullable()
    java.lang.String address, @com.squareup.moshi.Json(name = "photo_url")
    @org.jetbrains.annotations.Nullable()
    java.lang.String photoUrl, @org.jetbrains.annotations.NotNull()
    java.util.List<? extends java.util.Map<java.lang.String, ? extends java.lang.Object>> documents, @org.jetbrains.annotations.Nullable()
    java.lang.String gender, @org.jetbrains.annotations.Nullable()
    java.lang.String dob, @com.squareup.moshi.Json(name = "school_institute")
    @org.jetbrains.annotations.Nullable()
    java.lang.String schoolInstitute, @org.jetbrains.annotations.Nullable()
    java.lang.String board, @org.jetbrains.annotations.Nullable()
    java.lang.String category, @com.squareup.moshi.Json(name = "emergency_phone")
    @org.jetbrains.annotations.Nullable()
    java.lang.String emergencyPhone, @com.squareup.moshi.Json(name = "parent_email")
    @org.jetbrains.annotations.Nullable()
    java.lang.String parentEmail, @com.squareup.moshi.Json(name = "contact_email")
    @org.jetbrains.annotations.Nullable()
    java.lang.String contactEmail, @com.squareup.moshi.Json(name = "admission_date")
    @org.jetbrains.annotations.Nullable()
    java.lang.String admissionDate, @com.squareup.moshi.Json(name = "course_duration")
    @org.jetbrains.annotations.Nullable()
    java.lang.String courseDuration, @com.squareup.moshi.Json(name = "counsellor_id")
    @org.jetbrains.annotations.Nullable()
    java.lang.String counsellorId, @org.jetbrains.annotations.Nullable()
    java.lang.String luid, @com.squareup.moshi.Json(name = "enrollment_number")
    @org.jetbrains.annotations.Nullable()
    java.lang.String enrollmentNumber, @org.jetbrains.annotations.Nullable()
    java.lang.String notes) {
        return null;
    }
    
    @java.lang.Override()
    public boolean equals(@org.jetbrains.annotations.Nullable()
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override()
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public java.lang.String toString() {
        return null;
    }
}