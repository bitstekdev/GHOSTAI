import React from 'react';
import { RefreshCcw, CreditCard, Truck } from 'lucide-react';

// Dashboard Page
const Dashboard = () => {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Welcome Saketh</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
                    <h3 className="text-white text-sm mb-2">Total Stories Generated</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-5xl font-bold text-white">0</p>
                        <div className="flex gap-1 items-end h-16">
                            {[40, 60, 50, 70, 55, 80, 65, 75].map((h, i) => (
                                <div key={i} className="w-2 bg-purple-300 rounded" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white text-sm">Stories in Progress</h3>
                        <RefreshCcw size={20} className="text-gray-400" />
                    </div>
                    <p className="text-5xl font-bold text-white">0</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white text-sm">Credits</h3>
                        <CreditCard size={20} className="text-gray-400" />
                    </div>
                    <p className="text-5xl font-bold text-white">200</p>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white text-sm">Orders Dispatched</h3>
                        <Truck size={20} className="text-gray-400" />
                    </div>
                    <p className="text-5xl font-bold text-white">0</p>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl text-gray-300 mb-4">Last Working Story</h2>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-900 rounded-lg p-4 mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-semibold">
                                {i % 2 === 0 ? 'The Secret Doorway' : 'Shadows Under the Silver Moon'}
                            </h3>
                            <p className="text-purple-400 text-sm">Child Birthday • 1d ago</p>
                            <p className="text-gray-400 text-sm">Story in Progress</p>
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                            Open
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;