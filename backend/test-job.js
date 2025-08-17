const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const jobData = {
  title: "Dolore id dolorem et",
  category: "Plumbing",
  subcategory: "",
  description: "Recusandae Esse vol",
  street: "Incidunt quia qui i",
  city: "Enim voluptatem dol",
  state: "California",
  zipCode: "96586",
  budget: 100,
  timeline: "Within a week",
  date: "2015-12-04",
  time: "03:32",
  additionalRequests: "Facere qui sit temp",
  contactPreference: "email",
  images: ["blob:http://localhost:8080/871f1bed-67bf-4796-bdc5-9d151c200252"],
};

async function testJobCreation() {
  try {
    const response = await fetch("http://localhost:5000/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testJobCreation();
