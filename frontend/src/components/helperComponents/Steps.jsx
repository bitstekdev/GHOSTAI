import { ChevronRight } from 'lucide-react';

// Step 1: Story Details Page
const ProgressStep1 = () => {
  return (
    <div className="w-full py-3 px-2 sm:py-4 sm:px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {/* Step 1 - Active */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm sm:text-base ring-2 sm:ring-4 ring-purple-500/30">
            1
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Story Details</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 2 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            2
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Questionnaire</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 3 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            3
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Refined</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 4 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            4
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Generate Story</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 5 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            5
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Background</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 6 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            6
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Covers</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 7 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            7
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Your Book</span>
        </div>
      </div>
    </div>
  );
};

// Step 2: Questioner Page
const ProgressStep2 = () => {
  return (
    <div className="w-full py-3 px-2 sm:py-4 sm:px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {/* Step 1 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Story Details</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 2 - Active */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm sm:text-base ring-2 sm:ring-4 ring-purple-500/30">
            2
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Questionnaire</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 3 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            3
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Refined</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 4 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            4
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Generate Story</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 5 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            5
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Background</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 6 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            6
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Covers</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 7 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            7
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Your Book</span>
        </div>
      </div>
    </div>
  );
};

// Step 3: Refined Page
const ProgressStep3 = () => {
  return (
    <div className="w-full py-3 px-2 sm:py-4 sm:px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {/* Step 1 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Story Details</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 2 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Questionnaire</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 3 - Active */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm sm:text-base ring-2 sm:ring-4 ring-purple-500/30">
            3
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Refined</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 4 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            4
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Generate Story</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 5 - Inactive */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold">
            5
          </div>
          <span className="text-gray-500 font-medium text-sm hidden sm:inline">Background</span>
        </div>

        <ChevronRight className="text-gray-600" size={20} />

        {/* Step 6 - Inactive */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold">
            6
          </div>
          <span className="text-gray-500 font-medium text-sm hidden sm:inline">Covers</span>
        </div>

        <ChevronRight className="text-gray-600" size={20} />

        {/* Step 7 - Inactive */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold">
            7
          </div>
          <span className="text-gray-500 font-medium text-sm hidden sm:inline">Your Book</span>
        </div>
      </div>
    </div>
  );
};

// Step 4: Generate Story Page
const ProgressStep4 = () => {
  return (
    <div className="w-full py-4 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
        {/* Step 1 - Completed */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <span className="text-white font-medium text-sm hidden sm:inline">Story Details</span>
        </div>

        <ChevronRight className="text-purple-500" size={20} />

        {/* Step 2 - Completed */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <span className="text-white font-medium text-sm hidden sm:inline">Questionnaire</span>
        </div>

        <ChevronRight className="text-purple-500" size={20} />

        {/* Step 3 - Completed */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <span className="text-white font-medium text-sm hidden sm:inline">Refined</span>
        </div>

        <ChevronRight className="text-purple-500" size={20} />

        {/* Step 4 - Active */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold ring-4 ring-purple-500/30">
            4
          </div>
          <span className="text-white font-medium text-sm hidden sm:inline">Generate Story</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 5 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            5
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Background</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 6 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            6
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Covers</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 7 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            7
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Your Book</span>
        </div>
      </div>
    </div>
  );
};

// Step 5: Generate Background Image Page
const ProgressStep5 = () => {
  return (
    <div className="w-full py-3 px-2 sm:py-4 sm:px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {/* Step 1 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Story Details</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 2 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Questionnaire</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 3 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Refined</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 4 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Generate Story</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 5 - Active */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm sm:text-base ring-2 sm:ring-4 ring-purple-500/30">
            5
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Background</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 6 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            6
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Covers</span>
        </div>

        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 7 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            7
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Your Book</span>
        </div>
      </div>
    </div>
  );
};

// Step 6: Results Page
const ProgressStep6 = () => {
  return (
    <div className="w-full py-3 px-2 sm:py-4 sm:px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {/* Step 1 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Story Details</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 2 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Questionnaire</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 3 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Refined</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 4 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Generate Story</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 5 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Background</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 6 - Active */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm sm:text-base ring-2 sm:ring-4 ring-purple-500/30">
            6
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Covers</span>
        </div>
        
        <ChevronRight className="text-gray-600 flex-shrink-0" size={16} />

        {/* Step 7 - Inactive */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold text-sm sm:text-base">
            7
          </div>
          <span className="text-gray-500 font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Your Book</span>
        </div>
      </div>
    </div>
  );

};
// Step 7: Results Page
const ProgressStep7 = () => {
  return (
    <div className="w-full py-3 px-2 sm:py-4 sm:px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {/* Step 1 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Story Details</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 2 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Questionnaire</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 3 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Refined</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 4 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Generate Story</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 5 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Background</span>
        </div>

        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 6 - Completed */}
         <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Covers</span>
        </div>
        
        <ChevronRight className="text-purple-500 flex-shrink-0" size={16} />

        {/* Step 7 - Completed */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
            ✓
          </div>
          <span className="text-white font-medium text-xs sm:text-sm hidden md:inline whitespace-nowrap">Your Book</span>
      </div>
    </div>  
    </div>
  );
};



export {ProgressStep1, ProgressStep2, ProgressStep3, ProgressStep4, ProgressStep5, ProgressStep6, ProgressStep7};