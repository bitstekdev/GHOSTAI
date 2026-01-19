import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import api from "../../services/axiosInstance";
import { useCart } from "../../context/CartContext";
import { useNavigate, useParams } from "react-router-dom";
import PlanSelector from "./PlanSelector";

const AddToCartPage = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [story, setStory] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);
  console.log("story:", story);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const storyRes = await api.get(`/api/v1/story/${storyId}`);
      const planRes = await api.get(
        "/api/v1/subscriptions/plans/byShowOnContext?context=purchase"
      );

      console.log("Story API:", storyRes.data);
      console.log("Plan API:", planRes.data);

      const storyData =
        storyRes.data.story ||
        storyRes.data.data ||
        storyRes.data.result;

      setStory(storyData.story);
      setPlans(planRes.data.plans || []);
      setSelectedPlan(planRes.data.plans?.[0]?._id || null);
    } catch (err) {
      console.error("AddToCart error:", err);
    }
  };

  fetchData();
}, [storyId]);


  const handleAdd = async () => {
    await addToCart({
      storyId,
      planId: selectedPlan,
      quantity,
    });
    navigate("/cart");
  };


  if (!story) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading story...
    </div>
  );
}

if (!plans?.length) {
  return (
    <p className="text-gray-400">
      No plans available
    </p>
  );
}


  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      {/* Story Header */}
<div className="flex gap-6 items-start mb-10">
   <img
          src={story.coverImage?.s3Url}
          alt={story.title}
          className={`rounded-xl object-cover border border-gray-800 ${
            story.orientation === "landscape"
              ? "w-56 h-40"
              : story.orientation === "portrait"
              ? "w-40 h-56"
              : "w-48 h-48"
          }`}
        />

  <div>
    <h1 className="text-3xl font-bold mb-2">
      {story.title}
    </h1>

    <p className="text-gray-400 text-sm mb-1">
      {story.numOfPages} pages • {story.orientation}
    </p>

  </div>
</div>


      {/* Quantity */}
     <div className="flex items-center gap-6 mb-12">
  <button
    onClick={() => setQuantity(Math.max(1, quantity - 1))}
    className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-purple-500"
  >
    <Minus size={18} />
  </button>

  <span className="text-xl font-semibold w-6 text-center">
    {quantity}
  </span>

  <button
    onClick={() => setQuantity(quantity + 1)}
    className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-purple-500"
  >
    <Plus size={18} />
  </button>
</div>


      {/* Plans */}
      <PlanSelector
        plans={plans}
        selected={selectedPlan}
        onSelect={setSelectedPlan}
      />

    <button
  onClick={handleAdd}
  className="mt-14 w-full bg-gradient-to-r from-purple-600 to-pink-600
             py-5 rounded-2xl text-lg font-bold hover:opacity-90 transition"
>
  Add to Cart
</button>

    </div>
  );
};

export default AddToCartPage;
