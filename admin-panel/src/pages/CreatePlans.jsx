// import { useState } from "react";
// import api from "../services/axiosInstance";

// export default function AdminCreatePlan() {
//   const [type, setType] = useState("subscription"); // subscription | purchase

//   const [form, setForm] = useState({
//     code: "",
//     name: "",
//     price: "",
//     description: "",
//     validityDays: 30,
//     displayOrder: 1,
//     badge: "",
//     isPopular: false,
//     showOnContext: ["initial"],
//     printType: "",
//     printSubType: "",
//     limits: {
//       maxPages: "",
//       maxBooks: "",
//       faceSwaps: "",
//       regenerations: "",
//       edits: "",
//       erases: "",
//     },
//   });

//   const handleChange = (e) => {
//     const { name, value, type: t, checked } = e.target;

//     if (name.startsWith("limits.")) {
//       const key = name.split(".")[1];
//       setForm((p) => ({ ...p, limits: { ...p.limits, [key]: value } }));
//     } else if (t === "checkbox") {
//       setForm((p) => ({ ...p, [name]: checked }));
//     } else {
//       setForm((p) => ({ ...p, [name]: value }));
//     }
//   };

//   const toggleContext = (ctx) => {
//     setForm((p) => ({
//       ...p,
//       showOnContext: p.showOnContext.includes(ctx)
//         ? p.showOnContext.filter((c) => c !== ctx)
//         : [...p.showOnContext, ctx],
//     }));
//   };

//   const submit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       ...form,
//       type,
//       price: Number(form.price),
//       validityDays: Number(form.validityDays),
//       displayOrder: Number(form.displayOrder),
//       limits:
//         type === "subscription"
//           ? Object.fromEntries(
//               Object.entries(form.limits).map(([k, v]) => [k, Number(v || 0)])
//             )
//           : {},
//     };

//     await api.post("/api/v1/subscriptions/plans", payload);
//     alert("Plan created!");
//   };

//   return (
//     <div className="p-10 text-white max-w-5xl mx-auto">
//       <h1 className="text-4xl font-bold mb-8">Admin – Create Plan</h1>

//       <form onSubmit={submit} className="bg-gray-900 p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
//         <select value={type} onChange={(e) => setType(e.target.value)} className="input">
//           <option value="subscription">Subscription Plan</option>
//           <option value="purchase">Purchase (Print) Plan</option>
//         </select>

//         <input className="input" name="code" placeholder="Code" onChange={handleChange} required />
//         <input className="input" name="name" placeholder="Name" onChange={handleChange} required />
//         <input className="input" type="number" name="price" placeholder="Price" onChange={handleChange} required />
//         <input className="input" name="badge" placeholder="Badge" onChange={handleChange} />

//         <textarea className="input md:col-span-2" name="description" placeholder="Description" onChange={handleChange} />

//         <div className="flex gap-3 md:col-span-2">
//           {["initial", "purchase", "upgrade", "test"].map((c) => (
//             <button
//               type="button"
//               key={c}
//               onClick={() => toggleContext(c)}
//               className={`px-4 py-2 rounded ${form.showOnContext.includes(c) ? "bg-purple-600" : "bg-gray-700"}`}
//             >
//               {c}
//             </button>
//           ))}
//         </div>

//         {type === "purchase" && (
//           <>
//             <input className="input" name="printType" placeholder="softcover / hardcover / both" onChange={handleChange} />
//             <input className="input" name="printSubType" placeholder="Spark / Bloom / Legacy" onChange={handleChange} />
//           </>
//         )}

//         {type === "subscription" && (
//           <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
//             {Object.keys(form.limits).map((k) => (
//               <input key={k} name={`limits.${k}`} type="number" placeholder={k} onChange={handleChange} className="input" />
//             ))}
//           </div>
//         )}

//         <button className="bg-purple-600 hover:bg-purple-700 py-4 rounded-xl md:col-span-2">
//           Create Plan
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import api from "../services/axiosInstance";

export default function AdminCreatePlan() {
  const [type, setType] = useState("subscription");

  const [form, setForm] = useState({
    code: "",
    name: "",
    price: "",
    description: "",
    validityDays: 30,
    displayOrder: 1,
    badge: "",
    isPopular: false,
    showOnContext: ["initial"],
    printType: "",
    printSubType: "",
    limits: {
      maxPages: "",
      maxBooks: "",
      faceSwaps: "",
      regenerations: "",
      edits: "",
      erases: "",
    },
  });

  const handleChange = (e) => {
    const { name, value, type: t, checked } = e.target;
    if (name.startsWith("limits.")) {
      const key = name.split(".")[1];
      setForm(p => ({ ...p, limits: { ...p.limits, [key]: value }}));
    } else if (t === "checkbox") {
      setForm(p => ({ ...p, [name]: checked }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const toggleCtx = (c) =>
    setForm(p => ({
      ...p,
      showOnContext: p.showOnContext.includes(c)
        ? p.showOnContext.filter(x => x !== c)
        : [...p.showOnContext, c]
    }));

  const submit = async (e) => {
    e.preventDefault();

    if (!form.showOnContext.length) {
      alert("Select at least one context");
      return;
    }

    const payload = {
      code: form.code.toUpperCase(),
      name: form.name,
      price: Number(form.price),
      description: form.description,
      badge: form.badge,
      type,
      showOnContext: form.showOnContext,
      validityDays: Number(form.validityDays),
      displayOrder: Number(form.displayOrder),
      isPopular: form.isPopular,
      printType: type === "purchase" ? form.printType : undefined,
      printSubType: type === "purchase" ? form.printSubType : undefined,
      limits: type === "subscription"
        ? Object.fromEntries(Object.entries(form.limits).map(([k,v]) => [k, Number(v || 0)]))
        : undefined,
    };

    try {
      await api.post("/api/v1/subscriptions/plans", payload);
      alert("Plan created successfully!");
      setForm({
        code: "",
        name: "",
        price: "",
        description: "",
        validityDays: 30,
        displayOrder: 1,
        badge: "",
        isPopular: false,
        showOnContext: ["initial"],
        printType: "",
        printSubType: "",
        limits: {
          maxPages: "",
          maxBooks: "",
          faceSwaps: "",
          regenerations: "",
          edits: "",
          erases: "",
        },
      });
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto text-white">
      <h1 className="admin-title">Admin – Create Plan</h1>

      <form onSubmit={submit} className="admin-card grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* PLAN TYPE */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-white/70">Plan Type</label>
          <select value={type} onChange={e=>setType(e.target.value)} className="admin-input">
            <option value="subscription">Subscription Plan</option>
            <option value="purchase">Purchase (Print) Plan</option>
          </select>
        </div>

        {/* BASIC INFO */}
        <input className="admin-input" name="code" placeholder="Code (BASIC_199)" onChange={handleChange} required />
        <input className="admin-input" name="name" placeholder="Plan Name" onChange={handleChange} required />
        <input className="admin-input" type="number" name="price" placeholder="Price" onChange={handleChange} required />
        <input className="admin-input" name="badge" placeholder="Badge (Starter / Pro / Best Value)" onChange={handleChange} />
        <textarea className="admin-input md:col-span-2" name="description" placeholder="Description" onChange={handleChange} />

        {/* CONTEXT */}
        <div className="md:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-6">
          <h2 className="admin-section">Show On Context</h2>
          <div className="flex gap-4 flex-wrap">
            {["initial","purchase","generate","upgrade","all"].map(c => (
              <button
                key={c}
                type="button"
                onClick={()=>toggleCtx(c)}
                className={`admin-chip ${form.showOnContext.includes(c) ? "admin-chip-active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* LIMITS */}
        {type === "subscription" && (
          <div className="md:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-6">
            <h2 className="admin-section">Limits</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(form.limits).map(k => (
                <input key={k} name={`limits.${k}`} type="number" placeholder={k} onChange={handleChange} className="admin-input" />
              ))}
            </div>
          </div>
        )}

        {/* PRINT OPTIONS */}
        {type === "purchase" && (
          <>
            <select name="printType" value={form.printType} onChange={handleChange} className="admin-input" required>
              <option value="">Select Print Type</option>
              <option value="softcover">softcover</option>
              <option value="hardcover">hardcover</option>
              <option value="both">both</option>
            </select>
            <select name="printSubType" value={form.printSubType} onChange={handleChange} className="admin-input" required>
              <option value="">Select Print Series</option>
              <option value="Spark">Spark</option>
              <option value="Bloom">Bloom</option>
              <option value="Wander">Wander</option>
              <option value="Heirloom">Heirloom</option>
              <option value="Legacy">Legacy</option>
              <option value="Heritage">Heritage</option>
            </select>
          </>
        )}

        <button className="md:col-span-2 admin-btn-primary">
          Create Plan
        </button>
      </form>
    </div>
  );
}
