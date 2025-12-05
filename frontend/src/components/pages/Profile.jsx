import { useState } from "react";
import { User, MapPin, Lock } from "lucide-react";

export default function Profile() {
  // State management - easily replaceable with API data
  const [profile, setProfile] = useState({
    firstName: "Syed",
    lastName: "Naveedullah",
    email: "syed.naveedullah@example.com",
    phone: "+91 0000000000",
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Shaad Ali Khan",
      phone: "+98765 54321",
      address: "Green Land Colony, Secherale, Hyderabad Telangana, 500018",
    },
    {
      id: 2,
      name: "Lohith Kumar",
      phone: "+98765 54321",
      address: "Green Land Colony, Secherale, Hyderabad Telangana, 500018",
    },
  ]);

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Handler functions for integration
  const handleProfileUpdate = () => {
    console.log("Update profile:", profile);
    // TODO: Add API call here
    // await updateProfile(profile);
  };

  const handleAddAddress = () => {
    setShowAddForm(true);
  };

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      alert("Please fill all fields");
      return;
    }
    const addressToAdd = {
      ...newAddress,
      id: addresses.length + 1,
    };
    setAddresses([...addresses, addressToAdd]);
    setNewAddress({ name: "", phone: "", address: "" });
    setShowAddForm(false);
    console.log("New address added:", addressToAdd);
    // TODO: Add API call here
    // await addAddress(addressToAdd);
  };

  const handleCancelAdd = () => {
    setNewAddress({ name: "", phone: "", address: "" });
    setShowAddForm(false);
  };

  const handlePasswordChange = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Change password");
    // TODO: Add API call here
    // await changePassword(security);
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

          <button
            onClick={handleProfileUpdate}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
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
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              Add New Address
            </button>
          </div>

          <div className="space-y-4">
            {addresses.map((addr, index) => (
              <div
                key={addr.id}
                className="border-t border-gray-800 pt-4 first:border-t-0 first:pt-0"
              >
                <p className="text-sm text-purple-400 font-medium mb-1">
                  Address {index + 1}
                </p>
                <p className="text-sm text-white mb-0.5">{addr.name}</p>
                <p className="text-sm text-gray-400">{addr.phone}</p>
                <p className="text-sm text-gray-400 mt-1">{addr.address}</p>
              </div>
            ))}

            {showAddForm && (
              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, name: e.target.value })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Address
                    </label>
                    <textarea
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, address: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveAddress}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                    >
                      Save Address
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-[#1a1a1a] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-purple-500" />
            <h2 className="text-base font-semibold">Security</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={security.currentPassword}
                onChange={(e) =>
                  setSecurity({ ...security, currentPassword: e.target.value })
                }
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={security.newPassword}
                onChange={(e) =>
                  setSecurity({ ...security, newPassword: e.target.value })
                }
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={security.confirmPassword}
                onChange={(e) =>
                  setSecurity({ ...security, confirmPassword: e.target.value })
                }
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Change Password
          </button>
        </section>
      </div>
    </div>
  );
}