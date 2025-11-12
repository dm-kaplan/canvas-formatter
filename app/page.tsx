"use client";

import React, { useState } from "react";

// Import all your form components using standard Next.js path aliases
import AssessmentOverviewForm from "@/components/forms/AssessmentOverviewForm";
import CourseWelcomeForm from "@/components/forms/CourseWelcomeForm";
import DiscussionForm from "@/components/forms/DiscussionForm";
import InstructorPresentationForm from "@/components/forms/InstructorPresentationForm";
import LearningMaterialsForm from "@/components/forms/LearningMaterialsForm";
import MeetFacultyForm from "@/components/forms/MeetFacultyForm";
import ModuleForm from "@/components/forms/ModuleForm";
import SyllabusForm from "@/components/forms/SyllabusForm";
import CleanImportForm from "@/components/CleanImportForm";
import ConfigForm from "@/components/ConfigForm"; // Assuming this is part of the UI

// Define the available form types
type FormType =
  | "config"
  | "welcome"
  | "syllabus"
  | "faculty"
  | "assessment"
  | "module"
  | "presentation"
  | "materials"
  | "discussion"
  | "assignment";

export default function Home() {
  const [activeForm, setActiveForm] = useState<FormType>("config");
  
  // Dummy props for components that might still expect them
  // You can clean these up inside the components later
  const dummyProps = {
    isLoading: false,
    baseUrl: "/",
    courseId: "1",
  };

  const renderForm = () => {
    switch (activeForm) {
      case "config":
        return <ConfigForm />;
      case "welcome":
        return <CourseWelcomeForm {...dummyProps} />;
      case "syllabus":
        return <SyllabusForm {...dummyProps} />;
      case "faculty":
        return <MeetFacultyForm {...dummyProps} />;
      case "assessment":
        return <AssessmentOverviewForm {...dummyProps} />;
      case "module":
        return <ModuleForm {...dummyProps} />;
      case "presentation":
        return <InstructorPresentationForm {...dummyReactProps} />;
      case "materials":
        return <LearningMaterialsForm {...dummyProps} />;
      case "discussion":
        return <DiscussionForm {...dummyProps} />;
      case "assignment":
        return <CleanImportForm {...dummyProps} importType="assignment" />;
      default:
        return <ConfigForm />;
    }
  };

  const NavButton = ({
    form,
    label,
  }: {
    form: FormType;
    label: string;
  }) => (
    <button
      onClick={() => setActiveForm(form)}
      className={`px-3 py-2 text-sm font-medium rounded-md ${
        activeForm === form
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Canvas HTML Formatter
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <nav className="flex flex-wrap gap-2 justify-center">
            <NavButton form="config" label="Config" />
            <NavButton form="welcome" label="Welcome" />
            <NavButton form="syllabus" label="Syllabus" />
            <NavButton form="faculty" label="Faculty" />
            <NavButton form="assessment" label="Assessments" />
            <NavButton form="module" label="Module" />
            <NavButton form="presentation" label="Presentation" />
            <NavButton form="materials" label="Materials" />
            <NavButton form="discussion" label="Discussion" />
            <NavButton form="assignment" label="Assignment" />
          </nav>
        </div>

        <div className="w-full">{renderForm()}</div>
      </div>
    </main>
  );
}

// Dummy props for the InstructorPresentationForm which had a slightly different signature
const dummyReactProps = {
  isLoading: false,
  baseUrl: "/",
  courseId: "1",
  modules: [],
  isLoadingModules: false,
  onRefreshModules: () => {},
};