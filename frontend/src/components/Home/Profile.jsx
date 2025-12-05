import React, { useState } from "react";
import { FaGhost } from "react-icons/fa";

const card = "bg-[#23232a] border border-[#34343b] rounded-2xl p-6 shadow";
const label = "text-base text-zinc-300 mb-2 block";
const input =
  "w-full bg-[#18181c] border border-[#3b3b42] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none rounded-xl px-5 py-3 text-lg placeholder-zinc-500";
const cta =
  "inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 active:scale-[.99] transition text-white font-semibold rounded-xl px-6 py-3 text-lg";

/** Ghost rails that hug the container edges, not the viewport */
function GhostRails() {
  const common = "pointer-events-none select-none drop-shadow-sm";
  // left/right rail widths; adjust if you want more spacing from the cards
  const railBase = "hidden md:block absolute inset-y-0 w-16 z-20";

  // Create scattered positioning with both vertical and horizontal offsets
  const generateScatteredSpots = (count) => {
    return Array.from({ length: count }, () => ({
      top: Math.random() * 95 + 2, // 2-97% from top
      offset: Math.random() * 100 - 50, // -50% to +50% from center
    }));
  };

  // Generate random positions once
  const leftSpots = generateScatteredSpots(14);
  const rightSpots = generateScatteredSpots(14);

  // sizes and animations to cycle through (increased size variation)
  const sizes = ["text-3xl", "text-4xl", "text-5xl", "text-6xl", "text-7xl", "text-8xl"];
  const an = [
    "animate-bounce",
    "animate-pulse",
    "animate-[spin_9s_linear_infinite]",
    "animate-[spin_12s_linear_infinite]",
    "animate-[spin_15s_linear_infinite]",
    "animate-[spin_18s_linear_infinite]",
  ];
  const opac = ["text-white/5", "text-white/10", "text-white/15", "text-white/20"];

  return (
    <>
      {/* left rail with scattered ghosts */}
      <div className={`${railBase} -left-24`}>
        {leftSpots.map((spot, i) => (
          <FaGhost
            key={`L${i}`}
            className={`${common} absolute transform ${sizes[i % sizes.length]} ${
              an[i % an.length]
            } ${opac[i % opac.length]}`}
            style={{
              top: `${spot.top}%`,
              left: `${spot.offset}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* right rail with scattered ghosts */}
      <div className={`${railBase} -right-24`}>
        {rightSpots.map((spot, i) => (
          <FaGhost
            key={`R${i}`}
            className={`${common} absolute transform ${sizes[(i + 2) % sizes.length]} ${
              an[(i + 3) % an.length]
            } ${opac[(i + 1) % opac.length]}`}
            style={{
              top: `${spot.top}%`,
              right: `${spot.offset}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    </>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState({
    firstName: "Saketh",
    lastName: "Kumar",
    email: "saketh@example.com",
    phone: "+91 0000000000",
  });
  const [addresses, setAddresses] = useState([
    {
      name: "Manthri Saketh",
      phone: "+98765 54321",
      address: "Green Land Colony, Gachibowli, Hyderabad Telangana, 500018",
    },
    {
      name: "Lohith Kumar",
      phone: "+98765 54321",
      address: "Green Land Colony, Gachibowli, Hyderabad Telangana, 500018",
    },
  ]);
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", address: "" });

  const handleAddAddress = () => setShowAddForm(true);
  const handleSaveAddress = () => {
    if (!newAddress.name && !newAddress.phone && !newAddress.address) return;
    setAddresses((a) => [...a, { ...newAddress }]);
    setNewAddress({ name: "", phone: "", address: "" });
    setShowAddForm(false);
  };
  const handleCancelAdd = () => {
    setNewAddress({ name: "", phone: "", address: "" });
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      {/* Centered content wrapper: rails are positioned relative to THIS */}
      <div className="relative max-w-5xl mx-auto px-4 py-8 overflow-visible">
        {/* Ghosts beside the container */}
        <GhostRails />

        <h1 className="relative z-10 text-4xl font-extrabold tracking-tight mb-6">
          Profile
        </h1>

        {/* Profile Information */}
        <section className={`relative z-10 ${card} mb-6`}>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-100 mb-6">
            <span className="material-icons text-purple-400">person</span>
            Profile Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>First Name</label>
              <input
                className={input}
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Last Name</label>
              <input
                className={input}
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Email Address</label>
              <input
                className={input}
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Phone Number</label>
              <input
                className={input}
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6">
            <button className={cta}>
              <span className="material-icons text-[18px]">save</span>
              Save Changes
            </button>
          </div>
        </section>

        {/* Shipping Address */}
        <section className={`relative z-10 ${card} mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-100">
              <span className="material-icons text-purple-400">location_on</span>
              Shipping Address
            </h2>
            <button onClick={handleAddAddress} className={cta}>
              <span className="material-icons text-[18px]">add</span>
              Add New Address
            </button>
          </div>

          <div className="space-y-6">
            {addresses.map((addr, i) => (
              <div key={i} className="pt-6 first:pt-0 border-t border-zinc-700 first:border-0">
                <p className="text-purple-400 font-semibold">Address {i + 1}</p>
                <p className="mt-1 text-zinc-200">{addr.name}</p>
                <p className="text-zinc-400">{addr.phone}</p>
                <p className="mt-1 text-zinc-400">{addr.address}</p>
              </div>
            ))}
          </div>

          {showAddForm && (
            <div className="mt-6 p-4 bg-[#1b1b1e] rounded-lg border border-[#2b2b30]">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={label}>Recipient Name</label>
                  <input
                    className={input}
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={label}>Phone</label>
                  <input
                    className={input}
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={label}>Address</label>
                  <textarea
                    className={input + " h-28 resize-none"}
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={handleSaveAddress} className={cta}>Save Address</button>
                <button
                  onClick={handleCancelAdd}
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl px-4 py-2 text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Security */}
        <section className={`relative z-10 ${card}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-100 mb-6">
            <span className="material-icons text-purple-400">lock</span>
            Security
          </h2>

          <div className="space-y-4">
            <div>
              <label className={label}>Current Password</label>
              <input
                type="password"
                className={input}
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>New Password</label>
              <input
                type="password"
                className={input}
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Confirm New Password</label>
              <input
                type="password"
                className={input}
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button className={cta}>
                <span className="material-icons text-[18px]">vpn_key</span>
                Change Password
              </button>
            </div>
          </div>
        </section>

        <div className="h-10" />
      </div>
    </div>
  );
}
