import React, { useEffect, useState } from "react";

const Profile = () => {
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    role: "",
  });
  const token =  localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile), 
      });

      if (!response.ok) {
        throw new Error("Error updating profile");
      }

      const message = await response.text();
      alert(message); 
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="containerr">
      <div className="profile-box">
        <h1 className="profile-title">Hồ Sơ Của Tôi</h1>
        <p className="profile-subtitle">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>

        <div className="profile-content">
          <div className="profile-form-left">
            <div className="form-group">
              <label className="form-label">Tên đăng nhập</label>
              <input
                type="text"
                value={profile.fullname}
                readOnly
                className="form-input readonly"
              />
              <small className="form-helper">
                Tên Đăng nhập chỉ có thể thay đổi một lần.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Tên</label>
              <input
                type="text"
                placeholder="Nhập tên của bạn"
                value={profile.fullname}
                onChange={(e) =>
                  setProfile({ ...profile, fullname: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="form-input readonly"
              />
              <a href="#" className="form-link">
                Thay Đổi
              </a>
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                placeholder="Thêm"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                placeholder="Address"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="profile-form-right">
            <div className="avatar-container">
              <li style={{fontSize:"100px"}}><i class="fa-regular fa-user"></i></li>
              <button className="btn-upload">Profile</button>
            </div>
          </div>
        </div>

        <button className="btn-save" onClick={handleSave}>Lưu</button>
      </div>
    </div>
  );
};

export default Profile;
