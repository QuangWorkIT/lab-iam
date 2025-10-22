import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaInfoCircle, FaCalendarAlt } from "react-icons/fa";
import { fetchRolesForUser } from "../../../redux/features/userManagementSlice";

export default function AddUserModal({ isOpen, onClose, onSave }) {
    const dispatch = useDispatch();
    const { roles, rolesLoading } = useSelector((state) => state.users);

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
        accountStatus: "A", // A = Active, IA = Inactive
    });

    const [errors, setErrors] = useState({});

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
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
        if (!formData.identityNumber.trim()) newErrors.identityNumber = "Identity Number is required";
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone Number is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.birthdate) newErrors.birthdate = "Birthdate is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep2()) {
            // Prepare user data for saving
            const userData = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                roleCode: formData.roleCode,                  // Backend expects rolecode (not role)
                isActive: formData.accountStatus === "A",
                // Additional fields that might be needed
                phoneNumber: formData.phoneNumber,
                identityNumber: formData.identityNumber,  // Backend expects identityNumber
                birthdate: formData.birthdate,            // Backend expects birthdate
                address: formData.address,
                gender: formData.gender,
            };
            onSave(userData);
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
            accountStatus: "A",
        });
        setErrors({});
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
                                        Identify Number <span style={{ color: "#ff5a5f" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="identityNumber"
                                        value={formData.identityNumber}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: `1px solid ${errors.identifyNumber ? "#dc3545" : "#ddd"}`,
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            boxSizing: "border-box",
                                            borderLeft: "3px solid #ff5a5f",
                                            backgroundColor: "white",
                                            color: "#333",
                                        }}
                                        placeholder="Enter identify number"
                                    />
                                    {errors.identifyNumber && (
                                        <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                            {errors.identifyNumber}
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
                                    Enter password <span style={{ color: "#ff5a5f" }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
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
                                {errors.password && (
                                    <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                        {errors.password}
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
                                        color: "#ff5a5f",
                                    }}
                                >
                                    Confirm password <span style={{ color: "#ff5a5f" }}>*</span>
                                </label>
                                <input
                                    type="password"
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
                                        <span style={{ color: "#333", fontSize: "14px" }}>A</span>
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
                                        <span style={{ color: "#333", fontSize: "14px" }}>IA</span>
                                    </label>
                                </div>
                                {errors.accountStatus && (
                                    <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                        {errors.accountStatus}
                                    </span>
                                )}
                            </div>
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
                                Create
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
