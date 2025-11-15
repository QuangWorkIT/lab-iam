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
    const [focusedField, setFocusedField] = useState(""); // Track focus

    useEffect(() => {
        setFormData(initial);
        setErrors({});
    }, [initial]);

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

    const getInputStyle = (fieldName, baseColor = "#CCC") => ({
        width: "100%",
        padding: "9px 12px",
        borderRadius: 4,
        borderLeft: "3px solid #ff5a5f",
        fontSize: "14px",
        border: focusedField === fieldName
            ? "1px solid #FF5A5A"
            : `1px solid ${errors[fieldName] ? "#dc3545" : baseColor}`,
        outline: "none"
    });

    return (
        <form onSubmit={handleSubmit} style={{ padding: "1px 0 0 0", width: "100%" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "48px" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#ff5a5f", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                    <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>i</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#ff5a5f", textTransform: "uppercase" }}>UPDATE USER</h2>
            </div>

            {/* Form grid - 2 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 25px" }}>
                {/* LEFT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Full Name <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField("")}
                        style={getInputStyle("fullName")}
                        placeholder="Enter full name"
                    />
                    {errors.fullName && <span style={{ color: "#FF0000", fontSize: 11 }}>{errors.fullName}</span>}
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Date of Birth <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate ? dayjs(formData.birthdate).format("YYYY-MM-DD") : ""}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("birthdate")}
                        onBlur={() => setFocusedField("")}
                        max={dayjs().format("YYYY-MM-DD")}
                        style={getInputStyle("birthdate")}
                    />
                    {errors.birthdate && <span style={{ color: "#FF0000", fontSize: 11 }}>{errors.birthdate}</span>}
                </div>

                {/* LEFT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Phone Number <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("phoneNumber")}
                        onBlur={() => setFocusedField("")}
                        style={getInputStyle("phoneNumber", "#CCC")}
                        placeholder="e.g. 0912345678"
                    />
                    {errors.phoneNumber && <span style={{ color: "#FF0000", fontSize: 11 }}>{errors.phoneNumber}</span>}
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Address <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("address")}
                        onBlur={() => setFocusedField("")}
                        style={getInputStyle("address", "#CCC")}
                        placeholder="Enter address"
                    />
                    {errors.address && <span style={{ color: "#FF0000", fontSize: 11 }}>{errors.address}</span>}
                </div>

                {/* Gender - Full width (span 2 columns) */}
                <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 500 }}>Gender <span style={{ color: "#ff5a5f" }}>*</span></label>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "14px" }}>
                            <input type="radio" name="gender" value="MALE" checked={formData.gender === "MALE"} onChange={handleChange} style={{ accentColor: "#ff5a5f" }} />
                            <span>Male</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "14px" }}>
                            <input type="radio" name="gender" value="FEMALE" checked={formData.gender === "FEMALE"} onChange={handleChange} style={{ accentColor: "#ff5a5f" }} />
                            <span>Female</span>
                        </label>
                    </div>
                    {errors.gender && <span style={{ color: "#FF0000", fontSize: 11 }}>{errors.gender}</span>}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={onCancel} style={{ padding: "10px 22px", border: "1px solid #CCC", borderRadius: 6, backgroundColor: "white", color: "#666", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Cancel</button>
                <button 
                type="submit" 
                style={{ padding: "10px 22px", border: "none", 
                borderRadius: 6, backgroundColor: "#ff5a5f", 
                color: "white", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FF3A3A"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FF5A5F"}
                >Update</button>
            </div>
        </form>
    );
}
