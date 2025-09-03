import React, { useState } from "react";
import { User, Edit } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../store/slicer/userSlice";
import { userUpdateProfile } from "../../utils/services/Registration.services";

const EditProfile: React.FC = () => {
  const userData = useSelector((state: any) => state.user.userData);
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    userData?.profile_image || null
  );
  const [username, setUsername] = useState(userData?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("name", username);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      // Call your service function (returns AxiosResponse)
      const response: any = await userUpdateProfile(formData);

      // Check response structure (adjust if needed)
      if (response && response.status === 200 && response.data.success) {
        // Update Redux with new user data
        dispatch(updateUser({ userData: response.data.result.data }));
        setSuccess("Profile updated successfully!");
        setProfileImage(null);
      } else {
        setError(response?.data?.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
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
      <div className="relative w-28 h-28 mb-10">
        <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-14 h-14 text-gray-400" />
          )}
        </div>
        <label className="absolute -bottom-0 -right-0 p-2 bg-[#EDB726] rounded-full text-[#1D1F27] border border-[#1D1F27] z-10 shadow-md cursor-pointer">
          <Edit className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
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
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter new username"
        />
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="w-full max-w-sm mb-4 text-red-500 text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="w-full max-w-sm mb-4 text-green-500 text-center">
          {success}
        </div>
      )}

      {/* Update Profile Button */}
      <button
        onClick={handleUpdateProfile}
        disabled={loading}
        className={`w-full max-w-sm flex items-center justify-center py-3 px-6 rounded-lg mt-4 
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
