import structural from "@/assets/structural.jpg";
import myofascial from "@/assets/myofascial.jpg";
import spinal from "@/assets/spinal.jpg";

export const SITE_NAME = "Solstice Manual Therapy";

export const SERVICES = [
  {
    id: "structural",
    name: "Structural release",
    price: 140,
    minutes: 60,
    image: structural,
    blurb: "Deep, layered bodywork to unwind chronic tension across the back and hips.",
  },
  {
    id: "myofascial",
    name: "Myofascial glide",
    price: 120,
    minutes: 50,
    image: myofascial,
    blurb: "Slow sustained pressure that rehydrates and frees the connective tissue web.",
  },
  {
    id: "spinal",
    name: "Spinal mobilise",
    price: 150,
    minutes: 70,
    image: spinal,
    blurb: "Gentle joint articulation to restore range and quiet a busy nervous system.",
  },
] as const;

export const TIME_SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"];
