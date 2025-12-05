import React, { useMemo, useState } from 'react';
import GhostSidebar from './GhostSidebar';
import cover from '../../assets/images/coverpage.png';

const sampleOrders = [
  {
    id: 1,
    title: 'Rainbow Adventure',
    status: 'Ordered',
    genre: 'Family',
    length: '3-5 Pages',
    quantity: 2,
    price: 200,
    expected: 'Expected Delivery on Sunday 09 Nov',
    address:
      'Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032',
    date: 'On Mon, 03 Nov 2025',
    image: cover,
  },
  {
    id: 2,
    title: 'Sunday Surprise',
    status: 'Delivered',
    genre: 'Family',
    length: '3-5 Pages',
    quantity: 2,
    price: 200,
    expected: 'Delivered on Thursday 06 Nov',
    address:
      'Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032',
    date: 'On Mon, 03 Nov 2025',
    image: cover,
  },
  {
    id: 3,
    title: 'Forest of Wonders',
    status: 'Shipped',
    genre: 'Family',
    length: '3-5 Pages',
    quantity: 1,
    price: 250,
    expected: 'Shipped on Friday 07 Nov',
    address:
      'Greenland Colony, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana 500032',
    date: 'On Mon, 03 Nov 2025',
    image: cover,
  },
];

function statusPill(status) {
  const base = 'inline-block text-sm font-semibold px-4 py-1.5 rounded-full'; // increased pill text & padding
  if (status === 'Delivered') return `${base} bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30`;
  if (status === 'Shipped') return `${base} bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30`;
  if (status === 'Ordered') return `${base} bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30`;
  return `${base} bg-zinc-700/50 text-zinc-400 ring-1 ring-zinc-600/50`;
}

export default function OrderHistory() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All Orders');

  const filtered = useMemo(() => {
    return sampleOrders.filter((o) => {
      if (filter !== 'All Orders' && o.status !== filter) return false;
      if (query && !o.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, filter]);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <div className="flex">
        <GhostSidebar />

        {/* Content area: increased right padding and max width for more right-side space */}
        <main className="flex-1 px-10 py-12 pr-16">
          <h1 className="text-5xl font-extrabold mb-6">Order History</h1> {/* increased heading size */}

          {/* Search area stacked with filters below (buttons moved under search) */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="max-w-4xl w-full">
              <div className="relative">
                {/* search icon */}
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Order"
                  className="w-full bg-[#0f0f11] border-2 border-[#2b2330] rounded-xl px-14 py-4 text-lg placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-purple-600 transition"
                />
              </div>
            </div>

            {/* FILTER BUTTONS - now below search bar; increased size and spacing */}
            <div className="flex gap-4 items-center">
              {['All Orders', 'Delivered', 'Processing', 'Shipped'].map((p) => {
                const active = filter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    className={`px-5 py-3 rounded-full text-base font-semibold cursor-pointer shadow-sm transition ${
                      active
                        ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-500'
                        : 'bg-[#1e1b1f] text-zinc-300 border border-[#2b2a2d]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders container: expanded max width so it uses more horizontal space to the right */}
          <div className="space-y-6 max-w-[1400px]"> {/* increased from 1200 to 1400 */}
            {filtered.map((o) => (
              <div key={o.id} className="rounded-3xl p-1.5 bg-gradient-to-r from-[#1a1a1d] to-[#0b0b0d]">
                {/* widened right column by increasing grid column sizes */}
                <article className="bg-[#1f1c23] rounded-2xl p-6 border border-[#2f2c32] grid grid-cols-[120px_1fr_360px] gap-6 items-start">
                  {/* left: image */}
                  <div className="w-28 h-28 rounded-lg overflow-hidden bg-[#111] border border-[#3a3a40]">
                    <img src={o.image} alt={o.title} className="w-full h-full object-cover" />
                  </div>

                  {/* middle: details */}
                  <div className="flex flex-col">
                    <div className="flex items-start gap-4">
                      <h3 className="text-3xl font-bold text-violet-400 leading-tight">{o.title}</h3> {/* larger title */}
                      <span className={statusPill(o.status)}>{o.status}</span>
                    </div>

                    <div className="mt-4 space-y-2 text-base"> {/* increased body text size */}
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">Genre :</span>
                        <span className="text-zinc-200">{o.genre}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">Story Length:</span>
                        <span className="text-zinc-200">{o.length}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">Quantity:</span>
                        <span className="text-zinc-200">{o.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">Price:</span>
                        <span className="text-zinc-200 text-lg">₹{o.price}.0</span>
                      </div>
                    </div>

                    <p className="text-sm text-emerald-400 mt-5">{o.expected}</p>
                  </div>

                  {/* right column: date top-right, address block middle, reorder bottom */}
                  <div className="flex flex-col items-end justify-between h-full">
                    <div className="text-zinc-400 text-sm">{o.date}</div>

                    <div className="text-right text-base leading-relaxed"> {/* increased text size for address */}
                      <div className="text-zinc-400 mb-1 font-semibold">Delivery Address</div>
                      <div className="text-zinc-200">{o.address}</div>
                    </div>

                    <div>
                      <button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 py-3 text-base inline-flex items-center gap-3 shadow-lg transition-colors">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">↻</span>
                        Re-order
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
