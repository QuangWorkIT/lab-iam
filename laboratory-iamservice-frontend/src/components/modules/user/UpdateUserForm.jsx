import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

export default function UpdateUserForm({ user, roles, onCancel, onSubmit }) {
    const initial = useMemo(() => ({
        fullName: user?.fullName || user?.name || "",
        phoneNumber: user?.phoneNumber || user?.phone || "",
        identityNumber: user?.identityNumber || "",
        gender: user?.gender === "MALE" || user?.gender === "FEMALE" ? user.gender : "MALE",
        birthdate: user?.birthdate || user?.dateOfBirth || "",
        address: user?.address || "",
        isActive: user?.isActive ?? true,
        roleCode: user?.roleCode || user?.role || "",
    }), [user]);

    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initial);
        setErrors({});
    }, [initial]);

    const createFocusHandlers = () => ({
        onFocus: (e) => {
            e.target.style.boxShadow = "none";
            e.target.style.border = "1px solid #FF5A5A";
            e.target.style.borderLeft = "4px solid #FF5A5A";
            e.target.style.outline = "none";
        },
        onBlur: (e) => {
            e.target.style.outline = "none";
            e.target.style.border = "1px solid #CCC";
            e.target.style.borderLeft = "4px solid #FF5A5A";
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.identityNumber.trim()) {
            newErrors.identityNumber = "Identity number is required";
        } else if (!/^\+?\d*$/.test(formData.identityNumber)) {
            newErrors.identityNumber = "Identity number must contain only digits";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^\+?\d*$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Phone number must contain only digits";
        }

        if (!["MALE", "FEMALE"].includes(formData.gender)) {
            newErrors.gender = "Invalid gender value";
        }

        if (!formData.birthdate) {
            newErrors.birthdate = "Birthdate is required";
        } else {
            const d = dayjs(formData.birthdate, ["YYYY-MM-DD", "YYYY/MM/DD", "DD/MM/YYYY"], true);
            if (!d.isValid()) {
                newErrors.birthdate = "Invalid birthdate";
            } else if (d.isAfter(dayjs(), "day")) {
                newErrors.birthdate = "Birthdate must be in the past";
            }
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (!formData.roleCode) {
            newErrors.roleCode = "Role is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const payload = {
            fullName: formData.fullName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            identityNumber: formData.identityNumber.trim(),
            gender: formData.gender,
            birthdate: dayjs(formData.birthdate).format("YYYY-MM-DD"),
            address: formData.address.trim(),
            isActive: formData.isActive,
            roleCode: formData.roleCode,
        };

        onSubmit && onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: "0", width: "100%", maxWidth: "420px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", marginTop: "15px" }}>
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#ff5a5f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                }}>
                    <span style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>i</span>
                </div>
                <h2 style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#FF5A5A",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                }}>
                    UPDATE USER
                </h2>
            </div>

            {/* Form Fields Container */}
            <div style={{
                backgroundColor: "white",
                padding: "28px 24px",
                borderRadius: "12px",
                marginBottom: "24px"
            }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 40px" }}>
                    {/* Full Name */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Full Name <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            {...createFocusHandlers()}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.fullName ? "#FF0000" : "#CCC"}`,
                                borderRadius: 4,
                                borderLeft: `4px solid ${errors.fullName ? "#FF0000" : "#ff5a5f"}`,
                                fontSize: "14px",
                                boxSizing: "border-box",
                                backgroundColor: "white"
                            }}
                            placeholder=""
                        />
                        {errors.fullName && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.fullName}
                            </span>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Date of Birth <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate ? dayjs(formData.birthdate).format("YYYY-MM-DD") : ""}
                            onChange={handleChange}
                            max={dayjs().format("YYYY-MM-DD")}
                            {...createFocusHandlers()}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.birthdate ? "#FF0000" : "#CCC"}`,
                                borderRadius: 4,
                                borderLeft: `4px solid ${errors.birthdate ? "#FF0000" : "#ff5a5f"}`,
                                fontSize: "14px",
                                boxSizing: "border-box",
                                backgroundColor: "white"
                            }}
                        />
                        {errors.birthdate && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.birthdate}
                            </span>
                        )}
                    </div>

                    {/* Identify Number */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Identity Number <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="identityNumber"
                            value={formData.identityNumber}
                            onChange={handleChange}
                            {...createFocusHandlers()}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.identityNumber ? "#FF0000" : "#CCC"}`,
                                borderRadius: 4,
                                borderLeft: `4px solid ${errors.identityNumber ? "#FF0000" : "#ff5a5f"}`,
                                fontSize: "14px",
                                boxSizing: "border-box",
                                backgroundColor: "white"
                            }}
                            placeholder=""
                        />
                        {errors.identityNumber && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.identityNumber}
                            </span>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Phone Number <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            {...createFocusHandlers()}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.phoneNumber ? "#FF0000" : "#CCC"}`,
                                borderRadius: 4,
                                borderLeft: `4px solid ${errors.phoneNumber ? "#FF0000" : "#ff5a5f"}`,
                                fontSize: "14px",
                                boxSizing: "border-box",
                                backgroundColor: "white"
                            }}
                            placeholder=""
                        />
                        {errors.phoneNumber && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.phoneNumber}
                            </span>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Address <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            {...createFocusHandlers()}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.address ? "#FF0000" : "#CCC"}`,
                                borderRadius: 4,
                                borderLeft: `4px solid ${errors.address ? "#FF0000" : "#ff5a5f"}`,
                                fontSize: "14px",
                                boxSizing: "border-box",
                                backgroundColor: "white"
                            }}
                            placeholder=""
                        />
                        {errors.address && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.address}
                            </span>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Role <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                            <select
                                name="roleCode"
                                value={formData.roleCode}
                                onChange={handleChange}
                                {...createFocusHandlers()}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    paddingRight: "36px",
                                    border: `1px solid ${errors.roleCode ? "#FF0000" : "#CCC"}`,
                                    borderRadius: 4,
                                    borderLeft: `4px solid ${errors.roleCode ? "#FF0000" : "#ff5a5f"}`,
                                    fontSize: "14px",
                                    boxSizing: "border-box",
                                    cursor: "pointer",
                                    backgroundColor: "white",
                                    appearance: "none",
                                    WebkitAppearance: "none",
                                    MozAppearance: "none"
                                }}
                            >
                                <option value="">Select role</option>
                                {roles && roles.map(role => (
                                    <option key={role.code} value={role.code}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {/* Custom dropdown arrow */}
                            <div style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                color: "#ff5a5f",
                                fontSize: "9px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "2px",
                                lineHeight: "6px"
                            }}>
                                <span>▲</span>
                                <span>▼</span>
                            </div>
                        </div>
                        {errors.roleCode && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.roleCode}
                            </span>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Gender <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: 500
                            }}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={formData.gender === "MALE"}
                                    onChange={handleChange}
                                    style={{ accentColor: "#ff5a5f", width: "18px", height: "18px" }}
                                />
                                <span>M</span>
                            </label>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: 500
                            }}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={formData.gender === "FEMALE"}
                                    onChange={handleChange}
                                    style={{ accentColor: "#ff5a5f", width: "18px", height: "18px" }}
                                />
                                <span>F</span>
                            </label>
                        </div>
                        {errors.gender && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.gender}
                            </span>
                        )}
                    </div>

                    {/* Account Status */}
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}>
                            Account Status <span style={{ color: "#ff5a5f" }}>*</span>
                        </label>
                        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: 500
                            }}>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="true"
                                    checked={formData.isActive === true}
                                    onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                                    style={{ accentColor: "#ff5a5f", width: "18px", height: "18px" }}
                                />
                                <span>A</span>
                            </label>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: 500
                            }}>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="false"
                                    checked={formData.isActive === false}
                                    onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                                    style={{ accentColor: "#ff5a5f", width: "18px", height: "18px" }}
                                />
                                <span>IA</span>
                            </label>
                        </div>
                        {errors.isActive && (
                            <span style={{ color: "#FF0000", fontSize: 11, marginTop: "4px", display: "block" }}>
                                {errors.isActive}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 8
            }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        padding: "11px 32px",
                        border: "1px solid #CCC",
                        borderRadius: 6,
                        backgroundColor: "white",
                        color: "#666",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f5f5f5";
                        e.target.style.borderColor = "#999";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                        e.target.style.borderColor = "#CCC";
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    style={{
                        padding: "11px 32px",
                        border: "none",
                        borderRadius: 6,
                        backgroundColor: "#FF5A5A",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#FF3A3A"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#FF5A5A"}
                >
                    Continue
                </button>
            </div>
        </form>
    );
}
