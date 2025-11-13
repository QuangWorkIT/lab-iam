import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

export default function UpdateSelfForm({ user, onCancel, onSubmit }) {
    const initial = useMemo(() => ({
        fullName: user?.name || "",
        phoneNumber: user?.phoneNumber || "",
        gender: user?.gender === "MALE" || user?.gender === "FEMALE" ? user.gender : "MALE",
        birthdate: user?.dateOfBirth || user?.birthdate || "",
        address: user?.address || "",
    }), [user]);

    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initial);
        setErrors({});
    }, [initial]);

    // Thin black outline with offset; preserves existing border + red left bar
    const createFocusHandlers = () => ({
        onFocus: (e) => {
            e.target.style.boxShadow = "none";
            e.target.style.outline = "1px solid rgba(0,0,0,0.6)";
            e.target.style.outlineOffset = "2px"; // move outside so it won't cover the red bar
        },
        onBlur: (e) => {
            e.target.style.outline = "none";
            e.target.style.outlineOffset = "0px";
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
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
            if (!d.isValid()) newErrors.birthdate = "Invalid birthdate";
            else if (d.isAfter(dayjs(), "day")) newErrors.birthdate = "Birthdate must be in the past";
        }
        if (!formData.address.trim()) newErrors.address = "Address is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const payload = {
            fullName: formData.fullName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            gender: formData.gender,
            birthdate: dayjs(formData.birthdate).format("YYYY-MM-DD"),
            address: formData.address.trim(),
        };
        onSubmit && onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: "1px 0 0 0", width: "100%" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "48px" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#ff5a5f", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                    <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>i</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#ff5a5f", textTransform: "uppercase" }}>UPDATE USER</h2>
            </div>

            {/* Step indicator removed: single-step update */}

            {/* Form grid - 2 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 25px" }}>
                {/* LEFT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: 500 }}>Full Name <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        {...createFocusHandlers()}
                        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors.fullName ? "#dc3545" : "#ddd"}`, borderRadius: 4, borderLeft: "3px solid #ff5a5f", fontSize: "14px" }}
                        placeholder="Enter full name"
                    />
                    {errors.fullName && <span style={{ color: "#dc3545", fontSize: 11 }}>{errors.fullName}</span>}
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: 500 }}>Date of Birth <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate ? dayjs(formData.birthdate).format("YYYY-MM-DD") : ""}
                        onChange={handleChange}
                        max={dayjs().format("YYYY-MM-DD")}
                        {...createFocusHandlers()}
                        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors.birthdate ? "#dc3545" : "#ddd"}`, borderRadius: 4, borderLeft: "3px solid #ff5a5f", fontSize: "14px" }}
                    />
                    {errors.birthdate && <span style={{ color: "#dc3545", fontSize: 11 }}>{errors.birthdate}</span>}
                </div>

                {/* LEFT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: 500 }}>Phone Number <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        {...createFocusHandlers()}
                        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors.phoneNumber ? "#dc3545" : "#ddd"}`, borderRadius: 4, borderLeft: "3px solid #ff5a5f", fontSize: "14px" }}
                        placeholder="e.g. 0912345678"
                    />
                    {errors.phoneNumber && <span style={{ color: "#dc3545", fontSize: 11 }}>{errors.phoneNumber}</span>}
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: 500 }}>Address <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        {...createFocusHandlers()}
                        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors.address ? "#dc3545" : "#ddd"}`, borderRadius: 4, borderLeft: "3px solid #ff5a5f", fontSize: "14px" }}
                        placeholder="Enter address"
                    />
                    {errors.address && <span style={{ color: "#dc3545", fontSize: 11 }}>{errors.address}</span>}
                </div>

                {/* Gender - Full width (span 2 columns) */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: 500 }}>Gender <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "14px" }}>
                            <input type="radio" name="gender" value="MALE" checked={formData.gender === "MALE"} onChange={handleChange} style={{ accentColor: "#ff5a5f" }} />
                            <span>Male</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "14px" }}>
                            <input type="radio" name="gender" value="FEMALE" checked={formData.gender === "FEMALE"} onChange={handleChange} style={{ accentColor: "#ff5a5f" }} />
                            <span>Female</span>
                        </label>
                    </div>
                    {errors.gender && <span style={{ color: "#dc3545", fontSize: 11 }}>{errors.gender}</span>}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={onCancel} style={{ padding: "10px 22px", border: "1px solid #ddd", borderRadius: 6, backgroundColor: "white", color: "#666", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 22px", border: "none", borderRadius: 6, backgroundColor: "#ff5a5f", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Update</button>
            </div>
        </form>
    );
}


