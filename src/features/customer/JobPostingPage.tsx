import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ChevronRight, Calendar, Clock, X, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCustomer } from "@/contexts/CustomerContext";

const JobPostingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJob, updateJob, getJobById, loading } = useCustomer();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { id } = useParams();
  const isEditing = Boolean(id);

  const serviceCategories: Record<string, string[]> = {
    "Home Maintenance and Repairs": [
      "Plumbing",
      "Electrical Work",
      "HVAC Service",
      "Appliance Service",
      "General Handymen Service"
    ],
    "Cleaning Services": [
      "Residential Cleaning",
      "Commercial Cleaning",
      "Window Cleaning",
      "Move-in/Move-out Cleaning",
      "Pest Control Services"
    ],
    "Landscaping and Outdoor Services": [
      "Lawn Mowing and Maintenance",
      "Tree Trimming and Removal",
      "Garden Design and Installation",
      "Seasonal Cleanup",
      "Swimming Pool Cleaning and Maintenance"
    ],
    "Other Services": [
      "Moving Services",
      "Interior Design",
      "Home Security",
      "Smart Home Installation",
      "Home Inspection"
    ]
  };

  const [formData, setFormData] = useState({
    title: "",
    serviceCategory: "",
    serviceType: "",
    subcategory: "",
    description: "",
    street: "",
    city: "",
    state: "Illinois",
    zipCode: "",
    budget: "",
    timeline: "Specific Date",
    date: "",
    time: "",
    additionalRequests: "",
    contactPreference: "email",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length + images.length > 5) {
        toast({
          title: "Maximum 5 images allowed",
          description: "Please select fewer images",
          variant: "destructive",
        });
        return;
      }
      const newUrls = filesArray.map(file => URL.createObjectURL(file));
      setImages([...images, ...filesArray]);
      setImageUrls([...imageUrls, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages(images.filter((_, i) => i !== index));
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.serviceCategory || !formData.description || !formData.firstName || !formData.lastName) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields before proceeding",
          variant: "destructive",
        });
        return;
      }
      if (formData.contactPreference === "phone" && !formData.phoneNumber) {
        toast({ title: "Phone required", description: "Please enter your phone number.", variant: "destructive" });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.street || !formData.city || !formData.zipCode) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields before proceeding",
          variant: "destructive",
        });
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const handlePreviousStep = () => {
    if (currentStep === 1) {
      navigate("/customer/jobs");
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const jobData = {
        ...formData,
        budget: parseFloat(formData.budget),
        category: formData.serviceCategory,
        subcategory: formData.serviceType,
        location: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        images: imageUrls,
        tags: [formData.serviceCategory, formData.serviceType],
      };

      let result;
      if (isEditing && id) {
        result = await updateJob(id, jobData);
      } else {
        result = await createJob(jobData);
      }

      if (result) {
        toast({
          title: isEditing ? "Job Updated Successfully!" : "Job Posted Successfully!",
          description: isEditing 
            ? "Your job has been updated."
            : "Your job has been posted and is now visible to vendors.",
        });
        navigate("/customer");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (id && isEditing) {
      const jobToEdit = getJobById(id);
      if (jobToEdit) {
        setFormData({
          title: jobToEdit.title || "",
          serviceCategory: jobToEdit.category || "",
          serviceType: jobToEdit.subcategory || "",
          subcategory: jobToEdit.subcategory || "",
          description: jobToEdit.description || "",
          street: jobToEdit.street || "",
          city: jobToEdit.city || "",
          state: jobToEdit.state || "Illinois",
          zipCode: jobToEdit.zipCode || "",
          budget: jobToEdit.budget?.toString() || "",
          timeline: jobToEdit.timeline || "Specific Date",
          date: jobToEdit.date || "",
          time: jobToEdit.time || "",
          additionalRequests: jobToEdit.additionalRequests || "",
          contactPreference: jobToEdit.contactPreference || "email",
        });
      }
    }
  }, [id, isEditing, getJobById]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader className="bg-gray-100 dark:bg-gray-900 rounded-t-lg p-4 sm:p-6">
          <CardTitle className="text-2xl font-bold text-bojj-dark dark:text-white">Post a Job</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Tell us what you need and get quotes from qualified professionals
          </CardDescription>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-bojj-primary text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-bojj-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Step 1: Job Details */}
            {currentStep === 1 && (
              // <motion.div
              //   initial={{ opacity: 0, x: 20 }}
              //   animate={{ opacity: 1, x: 0 }}
              //   transition={{ duration: 0.3 }}
              //   className="space-y-4"
              // >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g., Kitchen renovation needed"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="serviceCategory" className="text-sm font-medium">Service Category *</Label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="mt-1 h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bojj-primary"
                      >
                        <span className={`${formData.serviceType ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                          {formData.serviceType || "Select a service"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute left-0 top-12 w-full max-w-md bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/2 max-h-60 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                              {Object.entries(serviceCategories).map(([category, services]) => (
                                <button
                                  key={category}
                                  type="button"
                                  className={`w-full text-left px-4 py-2.5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between ${activeCategory === category ? "bg-gray-100 dark:bg-gray-700/30" : ""}`}
                                  onClick={() => setActiveCategory(category)}
                                  onMouseEnter={() => setActiveCategory(category)}
                                >
                                  <span>{category}</span>
                                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                              ))}
                            </div>
                            {/* Subservices: show below on mobile, side on desktop */}
                            <div className="md:w-1/2 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-2 md:p-0" style={{ display: activeCategory ? "block" : "none" }}>
                              {activeCategory && serviceCategories[activeCategory].map((service) => (
                                <button
                                  key={service}
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      serviceCategory: activeCategory,
                                      serviceType: service
                                    }));
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-gray-900 dark:text-white hover:bg-bojj-primary/10 dark:hover:bg-bojj-primary/20 rounded"
                                >
                                  {service}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Describe your project in detail..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <Label className="text-sm font-medium">Photos (Optional)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-bojj-primary hover:text-bojj-primary/80">Upload photos</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 10MB (max 5 images)</p>
                      </div>
                    </div>
                    
                    {imageUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={e => handleChange("firstName", e.target.value)}
                        placeholder="Enter your first name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={e => handleChange("lastName", e.target.value)}
                        placeholder="Enter your last name"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>
              // </motion.div>
            )}

            {/* Step 2: Location & Budget */}
            {currentStep === 2 && (
              // <motion.div
              //   initial={{ opacity: 0, x: 20 }}
              //   animate={{ opacity: 1, x: 0 }}
              //   transition={{ duration: 0.3 }}
              //   className="space-y-4"
              // >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street" className="text-sm font-medium">Street Address *</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleChange("street", e.target.value)}
                      placeholder="123 Main St"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Chicago"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-sm font-medium">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleChange("zipCode", e.target.value)}
                        placeholder="Enter your ZIP code"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Illinois">Illinois</SelectItem>
                          <SelectItem value="California">California</SelectItem>
                          <SelectItem value="New York">New York</SelectItem>
                          <SelectItem value="Texas">Texas</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget" className="text-sm font-medium">Budget (Optional)</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => handleChange("budget", e.target.value)}
                      placeholder="$1000 - $5000"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">Providing a budget range helps vendors give accurate quotes</p>
                  </div>
                </div>
              // </motion.div>
            )}

            {/* Step 3: Timeline & Preferences */}
            {currentStep === 3 && (
              // <motion.div
              //   initial={{ opacity: 0, x: 20 }}
              //   animate={{ opacity: 1, x: 0 }}
              //   transition={{ duration: 0.3 }}
              //   className="space-y-4"
              // >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeline" className="text-sm font-medium">Timeline</Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleChange("timeline", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="ASAP">ASAP</SelectItem>
                          <SelectItem value="Within a week">Within a week</SelectItem>
                          <SelectItem value="Within a month">Within a month</SelectItem>
                          <SelectItem value="Specific Date">Specific Date</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.timeline === "Specific Date" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <Label htmlFor="date" className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">
                          Preferred Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleChange("date", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-bojj-primary focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="time" className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">
                          Preferred Time
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleChange("time", e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-bojj-primary focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="contactPreference" className="text-sm font-medium">Preferred Contact Method</Label>
                    <Select
                      value={formData.contactPreference}
                      onValueChange={value => setFormData(prev => ({ ...prev, contactPreference: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.contactPreference === "email" && (
                    <div className="mt-4">
                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="mt-1"
                        required
                      />
                    </div>
                  )}

                  {formData.contactPreference === "phone" && (
                    <div className="mt-4">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="Enter your phone number"
                        className="mt-1"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="additionalRequests" className="text-sm font-medium">Additional Requests</Label>
                    <Textarea
                      id="additionalRequests"
                      value={formData.additionalRequests}
                      onChange={(e) => handleChange("additionalRequests", e.target.value)}
                      placeholder="Any special requirements, preferences, or additional details..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              // </motion.div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800 p-4 sm:p-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} 
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            Back
          </Button>
          <Button 
            onClick={currentStep < 3 ? () => setCurrentStep(currentStep + 1) : handleSubmit} 
            className="bg-bojj-primary hover:bg-bojj-primary/90 text-white flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Posting...'}
              </>
            ) : currentStep < 3 ? (
              <>
                Continue
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              isEditing ? 'Update Job' : 'Submit & Get Bids'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JobPostingPage;








