// import { useState, useContext, useEffect } from "react";
// import { User, MapPin, Lock } from "lucide-react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { AppContext } from "../../context/AppContext";
// import api from "../../services/axiosInstance";


// export default function Profile() {

// const [showCurrent, setShowCurrent] = useState(false);
// const [showNew, setShowNew] = useState(false);
// const [showConfirm, setShowConfirm] = useState(false);

// const [newPassError, setNewPassError] = useState("");
// const [confirmPassError, setConfirmPassError] = useState("");
// const [msg, setMsg] = useState("");
// const [msgColor, setMsgColor] = useState("red");

// const [profile, setProfile] = useState({
//   firstName: "",
//   lastName: "",
//   email: "",
//   phone: "",
// });
// const [profileMsg, setProfileMsg] = useState("");

//   const [security, setSecurity] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newAddress, setNewAddress] = useState({
//   fullName: "",
//   email: "",
//   phoneNumber: "",
//   houseNumber: "",
//   streetName: "",
//   city: "",
//   state: "",
//   zipCode: "",
// });

// const { getProfile, updateProfile, changePassword, fetchAddresses, createAddress, addresses, loadingAddresses, addressError, backendUrl } = useContext(AppContext);

// // ----------- Fetch Profile Data & Addresses------------
// useEffect(() => {
//   const load = async () => {
//     // Fetch profile and addresses in parallel
//     const [user] = await Promise.all([getProfile(), fetchAddresses()]);
    
//     if (user) {
//       const [firstName, ...rest] = user.name.split(" ");
//       setProfile({
//         firstName,
//         lastName: rest.join(" "),
//         email: user.email,
//         phone: user.phone,
//         createdAt: user.createdAt,
//       });
//     }
//   };
//   load();
// }, []);


// // ------------Address Management----------------------------------------------

//   const [editingId, setEditingId] = useState(null);
//   const [editAddress, setEditAddress] = useState({
//   fullName: "",
//   email: "",
//   phoneNumber: "",
//   houseNumber: "",
//   streetName: "",
//   city: "",
//   state: "",
//   zipCode: "",
// });

//   const [addressLoading, setAddressLoading] = useState(false);

//   const [savingAddress, setSavingAddress] = useState(false);


//     const handleAddAddress = () => {
//     setShowAddForm(true);
//   };

//         const handleSaveAddress = async () => {
//           if (
//          newAddress.fullName.trim() === "" ||
//           newAddress.email.trim() === "" ||
//           newAddress.phoneNumber.trim() === "" ||
//           newAddress.houseNumber.trim() === "" ||
//           newAddress.streetName.trim() === "" ||
//           newAddress.city.trim() === "" ||
//           newAddress.state.trim() === "" ||
//           newAddress.zipCode.trim() === ""
//       ) {
//         alert("Please fill all fields");
//         return;
//       }

//     try {
//       setSavingAddress(true);
//       const result = await createAddress(newAddress);
//       console.log(result);
//       if (result.success) {
//         setNewAddress({ fullName: "", email: "", phoneNumber: "", houseNumber: "", streetName: "", city: "", state: "", zipCode: "",
//         });
//         fetchAddresses();
//         setShowAddForm(false);
//         console.log("New address added:", result.data);
//       } else {
//         alert(result.message);
//       }
//     } finally {
//       setSavingAddress(false);
//     }
//   };

//   const handleCancelAdd = () => {
//     setNewAddress({ fullName: "", email: "", phoneNumber: "", houseNumber: "", streetName: "", city: "", state: "", zipCode: "",});
//     setShowAddForm(false);
//   };

//   // Update address
// const updateAddress = async (id, payload) => {
//   try {
//     const { data } = await api.put(`${backendUrl}/api/v1/address/${id}`, payload);
//     return data;
//   } catch (error) {
//     return {
//       success: false,
//       message: error.response?.data?.message || "Failed to update address",
//     };
//   }
// };


// // Delete address
// const deleteAddress = async (id) => {
//   try {
//     const { data } = await api.delete(`${backendUrl}/api/v1/address/${id}`);
//     return data;
//   } catch (error) {
//     return {
//       success: false,
//       message: error.response?.data?.message || "Failed to delete address",
//     };
//   }
// };

// const handleEditClick = (addr) => {
//   setEditingId(addr._id);
//   setEditAddress({
//     fullName: addr.fullName,
//     email: addr.email,
//     phoneNumber: addr.phoneNumber,
//     houseNumber: addr.houseNumber,
//     streetName: addr.streetName,
//     city: addr.city,
//     state: addr.state,
//     zipCode: addr.zipCode,
//   });
// };


// const handleUpdateAddress = async (id) => {
//   setAddressLoading(true);
//   const res = await updateAddress(id, editAddress);
//   setAddressLoading(false);

//   if (res.success) {
//     setEditingId(null);
//     fetchAddresses();
//   } else {
//     alert(res.message);
//   }
// };

// const handleDeleteAddress = async (id) => {
//   if (!window.confirm("Are you sure you want to delete this address?")) return;

//   const res = await deleteAddress(id);
//   if (res.success) {
//     fetchAddresses();
//   } else {
//     alert(res.message);
//   }
// };

// // ---------------------------------------------------------------------------------------------


// // ----------- Handle Profile Update ------------
// const handleProfileUpdate = async () => {
//   const name = `${profile.firstName} ${profile.lastName}`;

//   const result = await updateProfile({
//     name,
//     email: profile.email,
//     phone: profile.phone,
//   });

//   setProfileMsg(result.message );

//   if (result.success) {
//     setMsgColor("green");
//   }
// };



// // ----------- Handle Password Change ------------ 

// const passwordValidation = (password) => {
//   const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//   if (!regex.test(password)) {
//     setNewPassError(
//       "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
//     );
//     return false;
//   }
//   setNewPassError("");
//   return true;
// };


// const handlePasswordChange = async () => {
//   if (security.newPassword !== security.confirmPassword) {
//     alert("Passwords do not match");
//     return;
//   }

//   const res = await changePassword(security);

//   setMsg(res.message);

//   if (res.success) {
//     setMsgColor("green");
//     setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
//   }
// };


//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-white">
//       <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
//         {/* Header */}
//         <h1 className="text-2xl font-bold mb-6">Profile</h1>

//         {/* Profile Information Section */}
//         <section className="bg-[#1a1a1a] rounded-lg p-5 mb-4">
//           <div className="flex items-center gap-2 mb-4">
//             <User className="w-4 h-4 text-purple-500" />
//             <h2 className="text-base font-semibold">Profile Information</h2>
//           </div>

//           <div className="space-y-3">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1.5">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   value={profile.firstName}
//                   onChange={(e) =>
//                     setProfile({ ...profile, firstName: e.target.value })
//                   }
//                   className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1.5">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   value={profile.lastName}
//                   onChange={(e) =>
//                     setProfile({ ...profile, lastName: e.target.value })
//                   }
//                   className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm text-gray-400 mb-1.5">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 value={profile.email}
//                 onChange={(e) =>
//                   setProfile({ ...profile, email: e.target.value })
//                 }
//                 className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm text-gray-400 mb-1.5">
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 value={profile.phone}
//                 onChange={(e) =>
//                   setProfile({ ...profile, phone: e.target.value })
//                 }
//                 className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
//               />
//             </div>
//           </div>
//           {profileMsg && (
//             <p className={`text-${msgColor}-500 text-sm mt-2`}>{profileMsg}</p>
//           )}

//           <button
//             onClick={handleProfileUpdate}
//             className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
//             Save Changes
//           </button>
//         </section>

//         {/* Shipping Address Section */}
//         <section className="bg-[#1a1a1a] rounded-lg p-5 mb-4">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2">
//               <MapPin className="w-4 h-4 text-purple-500" />
//               <h2 className="text-base font-semibold">Shipping Address</h2>
//             </div>
//             <button
//               onClick={handleAddAddress}
//               className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
//               Add New Address
//             </button>
//           </div>

//           <div className="space-y-4">
//             {loadingAddresses && (
//               <p className="text-gray-400 text-sm">Loading addresses...</p>
//             )}
//             {addressError && (
//               <p className="text-red-500 text-sm">{addressError}</p>
//             )}
//             {addresses.length === 0 && !loadingAddresses && (
//               <p className="text-gray-400 text-sm">No addresses saved yet.</p>
//             )}

//               {addresses.map((addr, index) => (
//                 <div
//                   key={addr._id}
//                   className="border-t border-gray-800 pt-4 first:border-t-0 first:pt-0">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="text-sm text-purple-400 font-medium mb-1">
//                         Address {index + 1}
//                       </p>

//               {editingId === addr._id ? (
//   <div className="space-y-2">
//     <input
//       type="text"
//       value={editAddress.fullName}
//       onChange={(e) =>
//         setEditAddress({ ...editAddress, fullName: e.target.value })
//       }
//       placeholder="Full Name"
//       className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//     />

//     <input
//       type="email"
//       value={editAddress.email}
//       onChange={(e) =>
//         setEditAddress({ ...editAddress, email: e.target.value })
//       }
//       placeholder="Email"
//       className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//     />

//     <input
//       type="tel"
//       value={editAddress.phoneNumber}
//       onChange={(e) =>
//         setEditAddress({ ...editAddress, phoneNumber: e.target.value })
//       }
//       placeholder="Phone Number"
//       className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//     />

//     <input
//       type="text"
//       value={editAddress.houseNumber}
//       onChange={(e) =>
//         setEditAddress({ ...editAddress, houseNumber: e.target.value })
//       }
//       placeholder="House Number"
//       className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//     />

//     <input
//       type="text"
//       value={editAddress.streetName}
//       onChange={(e) =>
//         setEditAddress({ ...editAddress, streetName: e.target.value })
//       }
//       placeholder="Street Name"
//       className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//     />

//     <div className="grid grid-cols-3 gap-2">
//       <input
//         type="text"
//         value={editAddress.city}
//         onChange={(e) =>
//           setEditAddress({ ...editAddress, city: e.target.value })
//         }
//         placeholder="City"
//         className="bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//       />

//       <input
//         type="text"
//         value={editAddress.state}
//         onChange={(e) =>
//           setEditAddress({ ...editAddress, state: e.target.value })
//         }
//         placeholder="State"
//         className="bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//       />

//       <input
//         type="text"
//         value={editAddress.zipCode}
//         onChange={(e) =>
//           setEditAddress({ ...editAddress, zipCode: e.target.value })
//         }
//         placeholder="ZIP"
//         className="bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
//       />
//     </div>

//     <div className="flex gap-2">
//       <button
//         onClick={() => handleUpdateAddress(addr._id)}
//         disabled={addressLoading}
//         className="bg-purple-600 px-3 py-1 text-sm rounded"
//       >
//         {addressLoading ? "Updating..." : "Update"}
//       </button>

//       <button
//         onClick={() => setEditingId(null)}
//         className="bg-gray-700 px-3 py-1 text-sm rounded"
//       >
//         Cancel
//       </button>
//     </div>
//   </div>
// ) : (
//                         <>
//                          <p className="font-medium">{addr.fullName}</p>
//                         <p className="text-sm text-gray-400">{addr.phoneNumber}</p>
//                         <p className="text-sm text-gray-400">{addr.email}</p>

//                         <p className="text-sm mt-1">
//                           {addr.houseNumber}, {addr.streetName}, {addr.city}, {addr.state} - {addr.zipCode}
//                         </p>
//                         </>
//                       )}
//                     </div>

//                     {/* ACTION BUTTONS */}
//                     {editingId !== addr._id && (
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleEditClick(addr)}
//                           className="text-purple-400 text-sm hover:underline">
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDeleteAddress(addr._id)}
//                           className="text-red-400 text-sm hover:underline">
//                           Delete
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}

//          {showAddForm && (
//   <div className="border-t border-gray-800 pt-4 mt-4">
//     <div className="space-y-3">
//       {/* Name & Email */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         <div>
//           <label className="block text-sm text-gray-400 mb-1.5">
//             Full Name
//           </label>
//           <input
//             type="text"
//             value={newAddress.fullName}
//             onChange={(e) =>
//               setNewAddress({ ...newAddress, fullName: e.target.value })
//             }
//             className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm text-gray-400 mb-1.5">
//             Email
//           </label>
//           <input
//             type="email"
//             value={newAddress.email}
//             onChange={(e) =>
//               setNewAddress({ ...newAddress, email: e.target.value })
//             }
//             className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//           />
//         </div>
//       </div>

//       {/* Phone & House Number */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         <div>
//           <label className="block text-sm text-gray-400 mb-1.5">
//             Phone Number
//           </label>
//           <input
//             type="tel"
//             value={newAddress.phoneNumber}
//             onChange={(e) =>
//               setNewAddress({ ...newAddress, phoneNumber: e.target.value })
//             }
//             className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm text-gray-400 mb-1.5">
//             House Number
//           </label>
//           <input
//             type="text"
//             value={newAddress.houseNumber}
//             onChange={(e) =>
//               setNewAddress({ ...newAddress, houseNumber: e.target.value })
//             }
//             className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//           />
//         </div>
//       </div>

//       {/* Street */}
//       <div>
//         <label className="block text-sm text-gray-400 mb-1.5">
//           Street Name
//         </label>
//         <input
//           type="text"
//           value={newAddress.streetName}
//           onChange={(e) =>
//             setNewAddress({ ...newAddress, streetName: e.target.value })
//           }
//           className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//         />
//       </div>

//       {/* City / State / Zip */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <div>
//           <label className="block text-sm text-gray-400 mb-1.5">
//             City
//           </label>
//           <input
//             type="text"
//             value={newAddress.city}
//             onChange={(e) =>
//               setNewAddress({ ...newAddress, city: e.target.value })
//             }
//             className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm text-gray-400 mb-1.5">
//             State
//           </label>
//           <input
//             type="text"
//             value={newAddress.state}
//             onChange={(e) =>
//               setNewAddress({ ...newAddress, state: e.target.value })
//             }
//             className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm text-gray-400 mb-1.5">
//             ZIP Code
//           </label>
//           <input
//             type="text"
//             value={newAddress.zipCode}
//             onChange={(e) =>
//               setNewAddress({ ...newAddress, zipCode: e.target.value })
//             }
//             className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
//           />
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-2 pt-2">
//         <button
//           onClick={handleSaveAddress}
//           disabled={savingAddress}
//           className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50"
//         >
//           {savingAddress ? "Saving..." : "Save Address"}
//         </button>

//         <button
//           onClick={handleCancelAdd}
//           disabled={savingAddress}
//           className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//           </div>
//         </section>

//         {/* Security Section */}
//         {/* Security Section */}
//         <section className="bg-[#1a1a1a] rounded-lg p-5 mt-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Lock className="w-4 h-4 text-purple-500" />
//             <h2 className="text-base font-semibold">Security</h2>
//           </div>

//           <div className="space-y-4">
//             {/* CURRENT PASSWORD */}
//             <div className="relative">
//               <label className="block text-sm text-gray-400 mb-1.5">
//                 Current Password
//               </label>
//               <input
//                 type={showCurrent ? "text" : "password"}
//                 value={security.currentPassword}
//                 onChange={(e) =>
//                   setSecurity({ ...security, currentPassword: e.target.value })
//                 }
//                 className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm pr-10 focus:outline-none focus:border-purple-500"
//               />
//               <span
//                 onClick={() => setShowCurrent(!showCurrent)}
//                 className="absolute right-3 top-[38px] text-gray-400 cursor-pointer">
//                 {showCurrent ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>

//             {/* NEW PASSWORD */}
//             <div className="relative">
//               <label className="block text-sm text-gray-400 mb-1.5">
//                 New Password
//               </label>
//               <input
//                 type={showNew ? "text" : "password"}
//                 value={security.newPassword}
//                 onChange={(e) => {
//                   setSecurity({ ...security, newPassword: e.target.value });
//                   passwordValidation(e.target.value);
//                 }}
//                 className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm pr-10 focus:outline-none focus:border-purple-500"
//               />
//               <span
//                 onClick={() => setShowNew(!showNew)}
//                 className="absolute right-3 top-[38px] text-gray-400 cursor-pointer">
//                 {showNew ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>
//             {newPassError && (
//               <p className="text-red-500 text-sm">{newPassError}</p>
//             )}

//             {/* CONFIRM NEW PASSWORD */}
//             <div className="relative">
//               <label className="block text-sm text-gray-400 mb-1.5">
//                 Confirm New Password
//               </label>
//               <input
//                 type={showConfirm ? "text" : "password"}
//                 value={security.confirmPassword}
//                 onChange={(e) => {
//                   setSecurity({ ...security, confirmPassword: e.target.value });

//                   if (e.target.value !== security.newPassword) {
//                     setConfirmPassError("Passwords do not match!");
//                   } else {
//                     setConfirmPassError("");
//                   }
//                 }}
//                 className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm pr-10 focus:outline-none focus:border-purple-500"
//               />
//               <span
//                 onClick={() => setShowConfirm(!showConfirm)}
//                 className="absolute right-3 top-[38px] text-gray-400 cursor-pointer">
//                 {showConfirm ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>
//             {confirmPassError && (
//               <p className="text-red-500 text-sm">{confirmPassError}</p>
//             )}
//           </div>
//           {msg && <p className={`text-${msgColor}-500 text-sm`}>{msg}</p>}

//           <button
//             onClick={handlePasswordChange}
//             disabled={newPassError || confirmPassError}
//             className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
//             Change Password
//           </button>
//         </section>
//         {profile.createdAt && (
//   <p className="text-right text-white text-sm mt-2 hover:text-purple-500 cursor-pointer">
//     - Joined At {new Date(profile.createdAt).toLocaleDateString()} -
//   </p>
// )}

//       </div>
//     </div>
//   );
// }

import { useState, useContext, useEffect } from "react";
import { User, MapPin, Lock } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";
import api from "../../services/axiosInstance";

export default function Profile() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newPassError, setNewPassError] = useState("");
  const [confirmPassError, setConfirmPassError] = useState("");
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("red");

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [profileMsg, setProfileMsg] = useState("");

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    houseNumber: "",
    streetName: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const { getProfile, updateProfile, changePassword, fetchAddresses, createAddress, addresses, loadingAddresses, addressError, backendUrl } = useContext(AppContext);

  // ----------- Fetch Profile Data & Addresses------------
  useEffect(() => {
    const load = async () => {
      const [user] = await Promise.all([getProfile(), fetchAddresses()]);
      
      if (user) {
        const [firstName, ...rest] = user.name.split(" ");
        setProfile({
          firstName,
          lastName: rest.join(" "),
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
        });
      }
    };
    load();
  }, []);

  // ------------Address Management----------------------------------------------
  const [editingId, setEditingId] = useState(null);
  const [editAddress, setEditAddress] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    houseNumber: "",
    streetName: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const handleAddAddress = () => {
    setShowAddForm(true);
  };

  const handleSaveAddress = async () => {
    const { fullName, email, phoneNumber, houseNumber, streetName, city, state, zipCode } = newAddress;
    
    if (!fullName || !email || !phoneNumber || !houseNumber || !streetName || !city || !state || !zipCode) {
      alert("Please fill all fields");
      return;
    }
    
    try {
      setSavingAddress(true);
      const result = await createAddress(newAddress);
      
      if (result.success) {
        setNewAddress({
          fullName: "",
          email: "",
          phoneNumber: "",
          houseNumber: "",
          streetName: "",
          city: "",
          state: "",
          zipCode: "",
        });
        fetchAddresses();
        setShowAddForm(false);
      } else {
        alert(result.message);
      }
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCancelAdd = () => {
    setNewAddress({
      fullName: "",
      email: "",
      phoneNumber: "",
      houseNumber: "",
      streetName: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setShowAddForm(false);
  };

  // Update address
  const updateAddress = async (id, payload) => {
    try {
      const { data } = await api.put(`${backendUrl}/api/v1/address/${id}`, payload);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update address",
      };
    }
  };

  // Delete address
  const deleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`${backendUrl}/api/v1/address/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete address",
      };
    }
  };

  const handleEditClick = (addr) => {
    setEditingId(addr._id);
    setEditAddress({
      fullName: addr.fullName,
      email: addr.email,
      phoneNumber: addr.phoneNumber,
      houseNumber: addr.houseNumber,
      streetName: addr.streetName,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
    });
  };

  const handleUpdateAddress = async (id) => {
    setAddressLoading(true);
    const res = await updateAddress(id, editAddress);
    setAddressLoading(false);

    if (res.success) {
      setEditingId(null);
      fetchAddresses();
    } else {
      alert(res.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    const res = await deleteAddress(id);
    if (res.success) {
      fetchAddresses();
    } else {
      alert(res.message);
    }
  };

  // ----------- Handle Profile Update ------------
  const handleProfileUpdate = async () => {
    const name = `${profile.firstName} ${profile.lastName}`;

    const result = await updateProfile({
      name,
      email: profile.email,
      phone: profile.phone,
    });

    setProfileMsg(result.message);

    if (result.success) {
      setMsgColor("green");
    }
  };

  // ----------- Handle Password Change ------------ 
  const passwordValidation = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!regex.test(password)) {
      setNewPassError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return false;
    }
    setNewPassError("");
    return true;
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await changePassword(security);
    setMsg(res.message);

    if (res.success) {
      setMsgColor("green");
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        {/* Profile Information Section */}
        <section className="bg-[#1a1a1a] rounded-lg p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-purple-500" />
            <h2 className="text-base font-semibold">Profile Information</h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          {profileMsg && (
            <p className={`text-${msgColor}-500 text-sm mt-2`}>{profileMsg}</p>
          )}

          <button
            onClick={handleProfileUpdate}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
            Save Changes
          </button>
        </section>

        {/* Shipping Address Section */}
        <section className="bg-[#1a1a1a] rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <h2 className="text-base font-semibold">Shipping Address</h2>
            </div>
            <button
              onClick={handleAddAddress}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
              Add New Address
            </button>
          </div>

          <div className="space-y-4">
            {loadingAddresses && (
              <p className="text-gray-400 text-sm">Loading addresses...</p>
            )}
            {addressError && (
              <p className="text-red-500 text-sm">{addressError}</p>
            )}
            {addresses.length === 0 && !loadingAddresses && (
              <p className="text-gray-400 text-sm">No addresses saved yet.</p>
            )}

            {addresses.map((addr, index) => (
              <div
                key={addr._id}
                className="border-t border-gray-800 pt-4 first:border-t-0 first:pt-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-purple-400 font-medium mb-1">
                      Address {index + 1}
                    </p>

                    {editingId === addr._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={editAddress.fullName}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                        />

                        <input
                          type="email"
                          placeholder="Email"
                          value={editAddress.email}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              email: e.target.value,
                            })
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                        />

                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={editAddress.phoneNumber}
                          onChange={(e) =>
                            setEditAddress({
                              ...editAddress,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="House Number"
                            value={editAddress.houseNumber}
                            onChange={(e) =>
                              setEditAddress({
                                ...editAddress,
                                houseNumber: e.target.value,
                              })
                            }
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                          />

                          <input
                            type="text"
                            placeholder="Street Name"
                            value={editAddress.streetName}
                            onChange={(e) =>
                              setEditAddress({
                                ...editAddress,
                                streetName: e.target.value,
                              })
                            }
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={editAddress.city}
                            onChange={(e) =>
                              setEditAddress({
                                ...editAddress,
                                city: e.target.value,
                              })
                            }
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                          />

                          <input
                            type="text"
                            placeholder="State"
                            value={editAddress.state}
                            onChange={(e) =>
                              setEditAddress({
                                ...editAddress,
                                state: e.target.value,
                              })
                            }
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                          />

                          <input
                            type="text"
                            placeholder="Zip Code"
                            value={editAddress.zipCode}
                            onChange={(e) =>
                              setEditAddress({
                                ...editAddress,
                                zipCode: e.target.value,
                              })
                            }
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleUpdateAddress(addr._id)}
                            disabled={addressLoading}
                            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 text-sm rounded disabled:opacity-50">
                            {addressLoading ? "Updating..." : "Update"}
                          </button>

                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-sm rounded">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-white font-medium">{addr.fullName}</p>
                        <p className="text-sm text-gray-400">{addr.email}</p>
                        <p className="text-sm text-gray-400">{addr.phoneNumber}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {addr.houseNumber} {addr.streetName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  {editingId !== addr._id && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditClick(addr)}
                        className="text-purple-400 text-sm hover:underline">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-red-400 text-sm hover:underline">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {showAddForm && (
              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, fullName: e.target.value })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newAddress.email}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, email: e.target.value })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newAddress.phoneNumber}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        House Number
                      </label>
                      <input
                        type="text"
                        value={newAddress.houseNumber}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            houseNumber: e.target.value,
                          })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Street Name
                      </label>
                      <input
                        type="text"
                        value={newAddress.streetName}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            streetName: e.target.value,
                          })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            city: e.target.value,
                          })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            zipCode: e.target.value,
                          })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveAddress}
                      disabled={savingAddress}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      disabled={savingAddress}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-[#1a1a1a] rounded-lg p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-purple-500" />
            <h2 className="text-base font-semibold">Security</h2>
          </div>

          <div className="space-y-4">
            {/* CURRENT PASSWORD */}
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1.5">
                Current Password
              </label>
              <input
                type={showCurrent ? "text" : "password"}
                value={security.currentPassword}
                onChange={(e) =>
                  setSecurity({ ...security, currentPassword: e.target.value })
                }
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm pr-10 focus:outline-none focus:border-purple-500"
              />
              <span
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-[38px] text-gray-400 cursor-pointer">
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* NEW PASSWORD */}
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1.5">
                New Password
              </label>
              <input
                type={showNew ? "text" : "password"}
                value={security.newPassword}
                onChange={(e) => {
                  setSecurity({ ...security, newPassword: e.target.value });
                  passwordValidation(e.target.value);
                }}
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm pr-10 focus:outline-none focus:border-purple-500"
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-[38px] text-gray-400 cursor-pointer">
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {newPassError && (
              <p className="text-red-500 text-sm">{newPassError}</p>
            )}

            {/* CONFIRM NEW PASSWORD */}
            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showConfirm ? "text" : "password"}
                value={security.confirmPassword}
                onChange={(e) => {
                  setSecurity({ ...security, confirmPassword: e.target.value });

                  if (e.target.value !== security.newPassword) {
                    setConfirmPassError("Passwords do not match!");
                  } else {
                    setConfirmPassError("");
                  }
                }}
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm pr-10 focus:outline-none focus:border-purple-500"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[38px] text-gray-400 cursor-pointer">
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {confirmPassError && (
              <p className="text-red-500 text-sm">{confirmPassError}</p>
            )}
          </div>
          {msg && <p className={`text-${msgColor}-500 text-sm`}>{msg}</p>}

          <button
            onClick={handlePasswordChange}
            disabled={newPassError || confirmPassError}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
            Change Password
          </button>
        </section>
        <p className="text-right text-white text-sm mt-2 hover:text-purple-500 cursor-pointer">
          - Joined At {new Date(profile.createdAt).toLocaleDateString()} -
        </p>
      </div>
    </div>
  );
}