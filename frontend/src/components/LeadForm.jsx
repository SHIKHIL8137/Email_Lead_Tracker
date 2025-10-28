import React, { useState } from "react";
import { Button, FormField, Card } from "./ui";

export function LeadForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "new",
    source: "website",
    notes: "",
    ...initialData,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.status) e.status = "Status is required";
    if (!formData.source) e.source = "Source is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter lead name"
          error={errors.name}
          onBlur={validate}
        />

        <FormField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter email address"
          error={errors.email}
          onBlur={validate}
        />

        <FormField
          label="Phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />

        <FormField
          as="select"
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          error={errors.status}
          onBlur={validate}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </FormField>

        <FormField
          as="select"
          label="Source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          required
          error={errors.source}
          onBlur={validate}
        >
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social Media</option>
          <option value="email">Email Campaign</option>
          <option value="other">Other</option>
        </FormField>

        <FormField
          as="textarea"
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Enter any additional notes..."
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialData.id ? "Update Lead" : "Add Lead"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
