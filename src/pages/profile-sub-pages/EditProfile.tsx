import React, { useState, useEffect } from "react";
import { User, Edit } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../store/slicer/userSlice";
import { userUpdateProfile } from "../../utils/services/Registration.services";
import { showToast } from "../../utils/toast.util";

const EditProfile: React.FC = () => {
  const userData = useSelector((state: any) => state.user.userData);
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);

  // Initialize state from userData when component mounts or userData changes
  useEffect(() => {
    if (userData) {
      setUsername(userData.name || "");
      setPreviewImage(userData.profile_image || null);
    }
  }, [userData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", username);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const response: any = await userUpdateProfile(formData);

      if (response && response.status === 200 && response.data.success) {
        const updatedUserData = { ...userData, ...response.data.result };
        dispatch(updateUser({ userData: updatedUserData }));
        showToast("Profile updated successfully!", "success");

        setProfileImage(null);
        setUsername(response.data.result.name || "");
        setPreviewImage(response.data.result.profile_image || null);
      } else {
        showToast(
          response?.data?.message || "Failed to update profile.",
          "error"
        );
      }
    } catch (err: any) {
      console.error("Update profile error:", err);

      let errorMessage = "An error occurred. Please try again.";

      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const firstKey = Object.keys(errors)[0];
          errorMessage = errors[firstKey][0] || errorMessage;
        }
      }

      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D1F27] text-white p-6 rounded-lg shadow-lg flex flex-col items-center">
      {/* Logo */}
      <div className="mb-6 text-center mt-8 lg:mt-0">
        <h1 className="text-3xl font-bold text-white mb-1">Wega di Number</h1>
        <p className="text-lg font-light text-[#EDB726] tracking-widest">
          online
        </p>
      </div>

      {/* Heading */}
      <h1 className="text-4xl mb-8 text-center">
        <span className="text-white">Edit </span>
        <span className="text-[#EDB726]">Profile</span>
      </h1>

      {/* Profile Image with Edit Icon */}
      {/* Profile Image with Edit Icon */}
      <div className="relative w-28 h-28 mb-10">
        <label className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-14 h-14 text-gray-400" />
          )}
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {/* Edit Icon positioned at bottom-right */}
          <div className="absolute -bottom-0 -right-0 p-2 bg-[#EDB726] rounded-full text-[#1D1F27] border border-[#1D1F27] z-10 shadow-md">
            <Edit className="w-4 h-4" />
          </div>
        </label>
      </div>

      {/* Change Username Input */}
      <div className="w-full max-w-sm mb-8">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-[#EDB726] mb-2"
        >
          Change Username
        </label>
        <input
          type="text"
          id="username"
          className="w-full px-4 py-3 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
          value={username}
          onChange={(e) => setUsername(e.target.value.slice(0, 20))} // limit input length to 20 characters
          maxLength={20} // HTML attribute to prevent typing more than 20 characters
          placeholder="Enter new username"
        />
      </div>

      {/* Error/Success Messages
      {error && (
        <div className="w-full max-w-sm mb-4 text-red-500 text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="w-full max-w-sm mb-4 text-green-500 text-center">
          {success}
        </div>
      )} */}

      {/* Update Profile Button */}
      <button
        onClick={handleUpdateProfile}
        disabled={loading}
        className={`w-full max-w-sm flex items-center justify-center py-3 px-6 rounded-lg mt-4 cursor-pointer
                   border border-[#EDB726] bg-gradient-to-r from-[#EDB726] to-[#d4a422] 
                   text-[#1D1F27] font-semibold transition-colors ${
                     loading ? "opacity-60 cursor-not-allowed" : ""
                   }`}
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </div>
  );
};

export default EditProfile;
