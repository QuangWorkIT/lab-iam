import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaInfoCircle, FaCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { fetchRolesForUser } from "../../../redux/features/userManagementSlice";

export default function AddUserModal({ isOpen, onClose, onSave }) {
    const dispatch = useDispatch();
    const { roles, rolesLoading } = useSelector((state) => state.users);
    const { userInfo } = useSelector((state) => state.user); // Get current logged-in user

    // Check if current user is LAB_MANAGER
    const isLabManager = userInfo?.role?.includes("ROLE_LAB_MANAGER");
    const isAdmin = userInfo?.role?.includes("ROLE_ADMIN");

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Basic Info Step
        fullName: "",
        identityNumber: "",
        phoneNumber: "",
        email: "",
        birthdate: "",
        address: "",
        gender: "MALE",
        // Password & Role Step
        password: "",
        confirmPassword: "",
        roleCode: "",
        accountStatus: isLabManager ? "IA" : "A", // LAB_MANAGER auto creates Inactive users
    });

    const [errors, setErrors] = useState({});
    const [isPasswordGenerated, setIsPasswordGenerated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = [
        { id: 1, title: "Basic Infor", label: "Basic Infor" },
        { id: 2, title: "Password & Role", label: "Password & Role" },
    ];

    // Fetch roles when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchRolesForUser());
        }
    }, [isOpen, dispatch]);

    // Handle PATIENT role - backend will auto-generate password and send via email
    useEffect(() => {
        const isPatientRole = formData.roleCode &&
            formData.roleCode.toString().toUpperCase().includes("PATIENT");

        console.log('Role check:', {
            roleCode: formData.roleCode,
            isPatient: isPatientRole
        });

        if (isPatientRole) {
            // Clear password fields - backend will generate and send via email
            setFormData(prev => ({
                ...prev,
                password: "",
                confirmPassword: ""
            }));
            setIsPasswordGenerated(true); // Flag to show email notification
            console.log('✅ PATIENT role selected - password will be sent via email');
        } else if (!isPatientRole && isPasswordGenerated) {
            // Reset when changing from PATIENT to another role
            setFormData(prev => ({
                ...prev,
                password: "",
                confirmPassword: ""
            }));
            setIsPasswordGenerated(false);
            console.log('🔄 Role changed from PATIENT - password input enabled');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.roleCode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }

        // Real-time email validation
        if (name === "email" && value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    [name]: "Please enter a valid email address (e.g., user@example.com)"
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    [name]: ""
                }));
            }
        }

        // Real-time identity number validation - only numbers
        if (name === "identityNumber" && value.trim()) {
            if (!/^\d+$/.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    [name]: "Identity Number must contain only numbers (0-9)"
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    [name]: ""
                }));
            }
        }

        // Real-time phone number validation - only numbers
        if (name === "phoneNumber" && value.trim()) {
            if (!/^\d+$/.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    [name]: "Phone Number must contain only numbers (0-9)"
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    [name]: ""
                }));
            }
        }

        // Check password strength in real-time
        if (name === "password") {
            const strength = {
                length: value.length >= 8,
                uppercase: /[A-Z]/.test(value),
                lowercase: /[a-z]/.test(value),
            };
            setPasswordStrength(strength);
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";

        if (!formData.identityNumber.trim()) {
            newErrors.identityNumber = "Identity Number is required";
        } else if (!/^\d+$/.test(formData.identityNumber)) {
            newErrors.identityNumber = "Identity Number must contain only numbers (0-9)";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone Number is required";
        } else if (!/^\d+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Phone Number must contain only numbers (0-9)";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "Please enter a valid email address (e.g., user@example.com)";
            }
        }
        if (!formData.birthdate) newErrors.birthdate = "Birthdate is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        const isPatientRole = formData.roleCode &&
            formData.roleCode.toString().toUpperCase().includes("PATIENT");

        // Only validate password for non-PATIENT roles
        if (!isPatientRole) {
            if (!formData.password.trim()) {
                newErrors.password = "Password is required";
            } else if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
                newErrors.password = "Password must be at least 8 characters long and include at least one uppercase and one lowercase letter";
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        if (!formData.roleCode) newErrors.roleCode = "Role Code is required";
        if (!formData.accountStatus) newErrors.accountStatus = "Account Status is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateStep2()) {
            setIsSubmitting(true);
            const isPatientRole = formData.roleCode &&
                formData.roleCode.toString().toUpperCase().includes("PATIENT");

            // Prepare user data for saving
            const userData = {
                fullName: formData.fullName,
                email: formData.email,
                roleCode: formData.roleCode,
                isActive: formData.accountStatus === "A",     // Backend Entity has 'isActive' field
                phoneNumber: formData.phoneNumber,
                identityNumber: formData.identityNumber,
                birthdate: formData.birthdate,
                address: formData.address,
                gender: formData.gender,
            };

            // Only include password for non-PATIENT roles
            // For PATIENT, backend will auto-generate and send via email
            if (!isPatientRole) {
                userData.password = formData.password;
            }

            console.log('📤 Submitting user data:', { ...userData, password: userData.password ? '***hidden***' : 'not included' });

            try {
                await onSave(userData);
            } catch (error) {
                // Handle backend errors
                console.error('❌ Error creating user:', error);
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to create user";

                // Check if error is related to email
                if (errorMessage.toLowerCase().includes('email')) {
                    setErrors(prev => ({
                        ...prev,
                        email: errorMessage
                    }));
                    // Go back to step 1 to show email error
                    setCurrentStep(1);
                } else {
                    // For other errors, show general error
                    setErrors(prev => ({
                        ...prev,
                        general: errorMessage
                    }));
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleCancel = () => {
        setCurrentStep(1);
        setFormData({
            fullName: "",
            identityNumber: "",
            phoneNumber: "",
            email: "",
            birthdate: "",
            address: "",
            gender: "MALE",
            password: "",
            confirmPassword: "",
            roleCode: "",
            accountStatus: isLabManager ? "IA" : "A",
        });
        setErrors({});
        setIsPasswordGenerated(false);
        setShowPassword(false);
        setPasswordStrength({});
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "32px",
                    width: "90%",
                    maxWidth: "800px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#ff5a5f",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                        }}
                    >
                        <FaInfoCircle style={{ color: "white", fontSize: "16px" }} />
                    </div>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "#ff5a5f",
                            textTransform: "uppercase",
                        }}
                    >
                        ADD NEW USER
                    </h2>
                </div>

                {/* Step Indicator */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "32px",
                    }}
                >
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        backgroundColor: currentStep >= step.id ? "#ff5a5f" : "#e0e0e0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "white",
                                            fontWeight: "600",
                                            fontSize: "16px",
                                        }}
                                    >
                                        {step.id}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: currentStep >= step.id ? "#ff5a5f" : "#999",
                                        fontWeight: "500",
                                    }}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    style={{
                                        margin: "0 16px",
                                        color: "#ccc",
                                        fontSize: "16px",
                                    }}
                                >
                                    &gt;
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* General Error Display */}
                {errors.general && (
                    <div style={{
                        marginBottom: "20px",
                        padding: "12px",
                        backgroundColor: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "4px",
                        color: "#c33",
                        fontSize: "14px"
                    }}>
                        {errors.general}
                    </div>
                )}

                {/* Form Content */}
                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "20px",
                            }}
                        >
                            {/* Left Column */}
                            <div>
                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        Full Name <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: `1px solid ${errors.fullName ? "#dc3545" : "#ddd"}`,
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                            borderLeft: "3px solid #ff5a5f",
                                            backgroundColor: "white",
                                            color: "#333",
                                        }}
                                        placeholder="Enter full name"
                                    />
                                    {errors.fullName && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.fullName}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        Identity Number <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="identityNumber"
                                        value={formData.identityNumber}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: `1px solid ${errors.identityNumber ? "#dc3545" : "#ddd"}`,
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                            borderLeft: "3px solid #ff5a5f",
                                            backgroundColor: "white",
                                            color: "#333",
                                        }}
                                        placeholder="Enter identity number"
                                    />
                                    {errors.identityNumber && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.identityNumber}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        Phone Number <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: `1px solid ${errors.phoneNumber ? "#dc3545" : "#ddd"}`,
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                            borderLeft: "3px solid #ff5a5f",
                                            backgroundColor: "white",
                                            color: "#333",
                                        }}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phoneNumber && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.phoneNumber}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        Email <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: `1px solid ${errors.email ? "#dc3545" : "#ddd"}`,
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                            borderLeft: "3px solid #ff5a5f",
                                            backgroundColor: "white",
                                            color: "#333",
                                        }}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        Birthdate <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type="date"
                                            name="birthdate"
                                            value={formData.birthdate}
                                            onChange={handleInputChange}
                                            style={{
                                                width: "100%",
                                                padding: "12px 40px 12px 12px",
                                                border: `1px solid ${errors.birthdate ? "#dc3545" : "#ddd"}`,
                                                borderRadius: "4px",
                                                fontSize: "14px",
                                                boxSizing: "border-box",
                                                borderLeft: "3px solid #ff5a5f",
                                                backgroundColor: "white",
                                                color: "#333",
                                            }}
                                        />
                                        <FaCalendarAlt
                                            style={{
                                                position: "absolute",
                                                right: "12px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                color: "#999",
                                                fontSize: "14px",
                                            }}
                                        />
                                    </div>
                                    {errors.birthdate && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.birthdate}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        Address <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: `1px solid ${errors.address ? "#dc3545" : "#ddd"}`,
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                            borderLeft: "3px solid #ff5a5f",
                                            backgroundColor: "white",
                                            color: "#333",
                                        }}
                                        placeholder="Enter address"
                                    />
                                    {errors.address && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.address}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        Gender <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "20px",
                                            alignItems: "center",
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="MALE"
                                                checked={formData.gender === "MALE"}
                                                onChange={handleInputChange}
                                                style={{
                                                    marginRight: "8px",
                                                    accentColor: "#ff5a5f",
                                                }}
                                            />
                                            <span style={{ color: "#333", fontSize: "14px" }}>M</span>
                                        </label>
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="FEMALE"
                                                checked={formData.gender === "FEMALE"}
                                                onChange={handleInputChange}
                                                style={{
                                                    marginRight: "8px",
                                                    accentColor: "#ff5a5f",
                                                }}
                                            />
                                            <span style={{ color: "#333", fontSize: "14px" }}>F</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }}
                        >
                            <div style={{ marginBottom: "20px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#ff5a5f",
                                    }}
                                >
                                    Role <span style={{ color: "#ff5a5f" }}>*</span>
                                </label>
                                <select
                                    name="roleCode"
                                    value={formData.roleCode}
                                    onChange={handleInputChange}
                                    disabled={rolesLoading}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: `1px solid ${errors.roleCode ? "#dc3545" : "#ddd"}`,
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                        boxSizing: "border-box",
                                        backgroundColor: "white",
                                        borderLeft: "3px solid #ff5a5f",
                                        color: "#333",
                                        cursor: rolesLoading ? "not-allowed" : "pointer",
                                        opacity: rolesLoading ? 0.6 : 1,
                                    }}
                                >
                                    <option value="">
                                        {rolesLoading ? "Loading roles..." : "Select a role"}
                                    </option>
                                    {roles.map((role) => (
                                        <option key={role.code} value={role.code}>
                                            {role.name || role.code}
                                        </option>
                                    ))}
                                </select>
                                {errors.roleCode && (
                                    <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                        {errors.roleCode}
                                    </span>
                                )}
                            </div>

                            {/* Password fields - Only show for non-PATIENT roles */}
                            {!isPasswordGenerated ? (
                                <>
                                    <div style={{ marginBottom: "20px" }}>
                                        <label
                                            style={{
                                                marginBottom: "8px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                color: "#ff5a5f",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <span>Enter password <span style={{ color: "#ff5a5f" }}>*</span></span>
                                        </label>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px 40px 12px 12px",
                                                    border: `1px solid ${errors.password ? "#dc3545" : "#ddd"}`,
                                                    borderRadius: "4px",
                                                    fontSize: "14px",
                                                    boxSizing: "border-box",
                                                    borderLeft: "3px solid #ff5a5f",
                                                    backgroundColor: "white",
                                                    color: "#333",
                                                }}
                                                placeholder="Enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: "absolute",
                                                    right: "12px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    backgroundColor: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: "4px",
                                                    color: "#666",
                                                }}
                                                title={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                                {errors.password}
                                            </span>
                                        )}
                                        <div style={{
                                            marginTop: "8px",
                                            padding: "12px",
                                            backgroundColor: "#f8f9fa",
                                            border: "1px solid #e9ecef",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            color: "#6c757d",
                                            lineHeight: "1.4"
                                        }}>
                                            <div style={{ fontWeight: "500", marginBottom: "4px", color: "#495057" }}>
                                                Password Requirements:
                                            </div>
                                            <ul style={{ margin: "0", paddingLeft: "16px" }}>
                                                <li style={{ color: passwordStrength.length ? "#28a745" : "#6c757d" }}>
                                                    ✓ At least 8 characters long {passwordStrength.length ? "✓" : ""}
                                                </li>
                                                <li style={{ color: passwordStrength.uppercase ? "#28a745" : "#6c757d" }}>
                                                    ✓ At least one uppercase letter (A-Z) {passwordStrength.uppercase ? "✓" : ""}
                                                </li>
                                                <li style={{ color: passwordStrength.lowercase ? "#28a745" : "#6c757d" }}>
                                                    ✓ At least one lowercase letter (a-z) {passwordStrength.lowercase ? "✓" : ""}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "20px" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: "8px",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                color: "#ff5a5f",
                                            }}
                                        >
                                            Confirm password <span style={{ color: "#ff5a5f" }}>*</span>
                                        </label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                border: `1px solid ${errors.confirmPassword ? "#dc3545" : "#ddd"}`,
                                                borderRadius: "4px",
                                                fontSize: "14px",
                                                boxSizing: "border-box",
                                                borderLeft: "3px solid #ff5a5f",
                                                backgroundColor: "white",
                                                color: "#333",
                                            }}
                                            placeholder="Confirm password"
                                        />
                                        {errors.confirmPassword && (
                                            <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                                {errors.confirmPassword}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Email notification for PATIENT role */
                                <div style={{
                                    marginBottom: "20px",
                                    padding: "20px",
                                    backgroundColor: "#e8f4fd",
                                    border: "2px solid #4a9eff",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        backgroundColor: "#4a9eff",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <FaInfoCircle style={{ color: "white", fontSize: "20px" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            margin: "0 0 8px 0",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#2563eb",
                                        }}>
                                            📧 Password Auto-Generation
                                        </h4>
                                        <p style={{
                                            margin: "0",
                                            fontSize: "14px",
                                            color: "#1e40af",
                                            lineHeight: "1.6",
                                        }}>
                                            Since this user is a <strong>PATIENT</strong>, the password will be automatically generated by the system and sent to <strong>{formData.email || "the user's email"}</strong>.
                                        </p>
                                        <p style={{
                                            margin: "8px 0 0 0",
                                            fontSize: "13px",
                                            color: "#3b82f6",
                                            fontStyle: "italic",
                                        }}>
                                            ℹ️ No need to enter a password manually.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Account Status - Only show for ADMIN, auto-set to Inactive for LAB_MANAGER */}
                            {isAdmin ? (
                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            color: "#ff5a5f",
                                        }}
                                    >
                                        Account Status <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "20px",
                                            alignItems: "center",
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="accountStatus"
                                                value="A"
                                                checked={formData.accountStatus === "A"}
                                                onChange={handleInputChange}
                                                style={{
                                                    marginRight: "8px",
                                                    accentColor: "#ff5a5f",
                                                }}
                                            />
                                            <span style={{ color: "#333", fontSize: "14px" }}>Active</span>
                                        </label>
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="accountStatus"
                                                value="IA"
                                                checked={formData.accountStatus === "IA"}
                                                onChange={handleInputChange}
                                                style={{
                                                    marginRight: "8px",
                                                    accentColor: "#ff5a5f",
                                                }}
                                            />
                                            <span style={{ color: "#333", fontSize: "14px" }}>Inactive</span>
                                        </label>
                                    </div>
                                    {errors.accountStatus && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.accountStatus}
                                        </span>
                                    )}
                                </div>
                            ) : isLabManager ? (
                                /* Info notification for LAB_MANAGER - User will be created as Inactive */
                                <div style={{
                                    marginBottom: "20px",
                                    padding: "20px",
                                    backgroundColor: "#fff3cd",
                                    border: "2px solid #ffc107",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        backgroundColor: "#ffc107",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <FaInfoCircle style={{ color: "white", fontSize: "20px" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            margin: "0 0 8px 0",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#856404",
                                        }}>
                                            ⏳ Account Pending Approval
                                        </h4>
                                        <p style={{
                                            margin: "0",
                                            fontSize: "14px",
                                            color: "#856404",
                                            lineHeight: "1.6",
                                        }}>
                                            As a <strong>Lab Manager</strong>, new users you create will be set to <strong>Inactive</strong> status and require <strong>Admin approval</strong> before they can access the system.
                                        </p>
                                        <p style={{
                                            margin: "8px 0 0 0",
                                            fontSize: "13px",
                                            color: "#856404",
                                            fontStyle: "italic",
                                        }}>
                                            ℹ️ Admin will review and activate the account in the Account Management section.
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                            marginTop: "32px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                padding: "12px 24px",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                                backgroundColor: "white",
                                color: "#666",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                            }}
                        >
                            Cancel
                        </button>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                style={{
                                    padding: "12px 24px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    backgroundColor: "white",
                                    color: "#666",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                }}
                            >
                                Back
                            </button>
                        )}
                        {currentStep < 2 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                style={{
                                    padding: "12px 24px",
                                    border: "none",
                                    borderRadius: "6px",
                                    backgroundColor: "#ff5a5f",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                }}
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: "12px 24px",
                                    border: "none",
                                    borderRadius: "6px",
                                    backgroundColor: isSubmitting ? "#ccc" : "#ff5a5f",
                                    color: "white",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    opacity: isSubmitting ? 0.6 : 1,
                                }}
                            >
                                {isSubmitting ? "Creating..." : "Create"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
