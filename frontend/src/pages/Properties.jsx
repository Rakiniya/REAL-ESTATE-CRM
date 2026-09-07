import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  FolderKanban,
  Home,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import {
  PageLoading,
  PageError,
  PageEmpty,
} from "../components/common/PageState";

import propertyService from "../services/propertyService";
import { useAuth } from "../context/AuthContext";
import { positiveNumber, required } from "../utils/validation";

const unitTypes = [
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "Villa",
  "Penthouse",
];

const emptyProjectForm = {
  name: "",
  location: "",
  description: "",
};

const emptyBuildingForm = {
  name: "",
};

const emptyUnitForm = {
  unit_number: "",
  type: "2BHK",
  price: "",
  status: "AVAILABLE",
};

export default function Properties() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [search, setSearch] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [projectsError, setProjectsError] = useState("");
  const [buildingsError, setBuildingsError] = useState("");
  const [unitsError, setUnitsError] = useState("");

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);

  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [buildingForm, setBuildingForm] = useState(emptyBuildingForm);
  const [unitForm, setUnitForm] = useState(emptyUnitForm);

  const [projectErrors, setProjectErrors] = useState({});
  const [buildingErrors, setBuildingErrors] = useState({});
  const [unitFormErrors, setUnitFormErrors] = useState({});

  const [savingProject, setSavingProject] = useState(false);
  const [savingBuilding, setSavingBuilding] = useState(false);
  const [savingUnit, setSavingUnit] = useState(false);

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setProjectsError("");

      const result = await propertyService.getProjects();

      setProjects(result);

      if (selectedProject) {
        const updatedProject = result.find(
          (project) => project.id === selectedProject.id
        );

        setSelectedProject(updatedProject || null);
      } else if (result.length > 0) {
        setSelectedProject(result[0]);
      }
    } catch (error) {
      console.error("Load projects error:", error);

      setProjectsError(
        error?.response?.data?.detail ||
          "Unable to load projects."
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  // ============================================================
  // LOAD BUILDINGS
  // ============================================================

  const loadBuildings = async (projectId) => {
    if (!projectId) {
      setBuildings([]);
      setSelectedBuilding(null);
      return;
    }

    try {
      setLoadingBuildings(true);
      setBuildingsError("");

      const result = await propertyService.getBuildings(projectId);

      setBuildings(result);

      if (selectedBuilding) {
        const updatedBuilding = result.find(
          (building) => building.id === selectedBuilding.id
        );

        setSelectedBuilding(updatedBuilding || null);
      } else if (result.length > 0) {
        setSelectedBuilding(result[0]);
      } else {
        setSelectedBuilding(null);
      }
    } catch (error) {
      console.error("Load buildings error:", error);

      setBuildingsError(
        error?.response?.data?.detail ||
          "Unable to load buildings."
      );

      setBuildings([]);
      setSelectedBuilding(null);
    } finally {
      setLoadingBuildings(false);
    }
  };

  // ============================================================
  // LOAD UNITS
  // ============================================================

  const loadUnits = async (buildingId) => {
    if (!buildingId) {
      setUnits([]);
      return;
    }

    try {
      setLoadingUnits(true);
      setUnitsError("");

      const result = await propertyService.getUnits(buildingId);

      setUnits(result);
    } catch (error) {
      console.error("Load units error:", error);

      setUnitsError(
        error?.response?.data?.detail ||
          "Unable to load units."
      );

      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setSelectedBuilding(null);
      loadBuildings(selectedProject.id);
    } else {
      setBuildings([]);
      setSelectedBuilding(null);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    if (selectedBuilding) {
      loadUnits(selectedBuilding.id);
    } else {
      setUnits([]);
    }
  }, [selectedBuilding?.id]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query)
    );
  }, [projects, search]);

  const filteredBuildings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return buildings;
    }

    return buildings.filter((building) =>
      building.name?.toLowerCase().includes(query)
    );
  }, [buildings, search]);

  const filteredUnits = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return units;
    }

    return units.filter(
      (unit) =>
        unit.unit_number?.toLowerCase().includes(query) ||
        unit.type?.toLowerCase().includes(query) ||
        unit.status?.toLowerCase().includes(query)
    );
  }, [units, search]);

  // ============================================================
  // INVENTORY SUMMARY
  // ============================================================

  const availableUnits = units.filter(
    (unit) => unit.status === "AVAILABLE"
  ).length;

  const bookedUnits = units.filter(
    (unit) => unit.status === "BOOKED"
  ).length;

  const inventoryValue = units.reduce(
    (total, unit) => total + Number(unit.price || 0),
    0
  );

  const availabilityPercentage =
    units.length > 0
      ? Math.round((availableUnits / units.length) * 100)
      : 0;

  // ============================================================
  // PROJECT MODAL
  // ============================================================

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(emptyProjectForm);
    setProjectErrors({});
    setProjectModalOpen(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);

    setProjectForm({
      name: project.name || "",
      location: project.location || "",
      description: project.description || "",
    });

    setProjectErrors({});
    setProjectModalOpen(true);
  };

  // ============================================================
  // BUILDING MODAL
  // ============================================================

  const openCreateBuilding = () => {
    if (!selectedProject) {
      toast.error("Please select a project first.");
      return;
    }

    setEditingBuilding(null);
    setBuildingForm(emptyBuildingForm);
    setBuildingErrors({});
    setBuildingModalOpen(true);
  };

  const openEditBuilding = (building) => {
    setEditingBuilding(building);

    setBuildingForm({
      name: building.name || "",
    });

    setBuildingErrors({});
    setBuildingModalOpen(true);
  };

  // ============================================================
  // UNIT MODAL
  // ============================================================

  const openCreateUnit = () => {
    if (!selectedBuilding) {
      toast.error("Please select a building first.");
      return;
    }

    setEditingUnit(null);
    setUnitForm(emptyUnitForm);
    setUnitFormErrors({});
    setUnitModalOpen(true);
  };

  const openEditUnit = (unit) => {
    setEditingUnit(unit);

    setUnitForm({
      unit_number: unit.unit_number || "",
      type: unit.type || "2BHK",
      price: unit.price ?? "",
      status: unit.status || "AVAILABLE",
    });

    setUnitFormErrors({});
    setUnitModalOpen(true);
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateProject = () => {
    const errors = {};

    if (!required(projectForm.name)) {
      errors.name = "Project name is required.";
    } else if (projectForm.name.trim().length < 2) {
      errors.name =
        "Project name must be at least 2 characters.";
    }

    if (!required(projectForm.location)) {
      errors.location = "Project location is required.";
    } else if (projectForm.location.trim().length < 2) {
      errors.location =
        "Location must be at least 2 characters.";
    }

    setProjectErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateBuilding = () => {
    const errors = {};

    if (!required(buildingForm.name)) {
      errors.name = "Building name is required.";
    } else if (buildingForm.name.trim().length < 2) {
      errors.name =
        "Building name must be at least 2 characters.";
    }

    setBuildingErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const validateUnit = () => {
    const errors = {};

    if (!required(unitForm.unit_number)) {
      errors.unit_number = "Unit number is required.";
    }

    if (!unitTypes.includes(unitForm.type)) {
      errors.type = "Please select a valid unit type.";
    }

    if (!required(unitForm.price)) {
      errors.price = "Unit price is required.";
    } else if (!positiveNumber(unitForm.price)) {
      errors.price = "Price must be greater than 0.";
    }

    if (!["AVAILABLE", "BOOKED"].includes(unitForm.status)) {
      errors.status = "Please select a valid unit status.";
    }

    setUnitFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // FORM CHANGES
  // ============================================================

  const handleProjectChange = (event) => {
    const { name, value } = event.target;

    setProjectForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setProjectErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleBuildingChange = (event) => {
    const { name, value } = event.target;

    setBuildingForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setBuildingErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleUnitChange = (event) => {
    const { name, value } = event.target;

    setUnitForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setUnitFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ============================================================
  // PROJECT SUBMIT
  // ============================================================

  const handleProjectSubmit = async (event) => {
    event.preventDefault();

    if (!validateProject()) {
      return;
    }

    try {
      setSavingProject(true);

      const payload = {
        name: projectForm.name.trim(),
        location: projectForm.location.trim(),
        description:
          projectForm.description.trim() || null,
      };

      let result;

      if (editingProject) {
        result = await propertyService.updateProject(
          editingProject.id,
          payload
        );

        toast.success("Project updated successfully.");
      } else {
        result = await propertyService.createProject(payload);

        toast.success("Project created successfully.");
      }

      await loadProjects();

      setSelectedProject(result);
      setProjectModalOpen(false);
    } catch (error) {
      console.error("Save project error:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to save project."
      );
    } finally {
      setSavingProject(false);
    }
  };

  // ============================================================
  // BUILDING SUBMIT
  // ============================================================

  const handleBuildingSubmit = async (event) => {
    event.preventDefault();

    if (!validateBuilding()) {
      return;
    }

    if (!selectedProject && !editingBuilding) {
      toast.error("Please select a project first.");
      return;
    }

    try {
      setSavingBuilding(true);

      const payload = {
        name: buildingForm.name.trim(),
      };

      let result;

      if (editingBuilding) {
        result = await propertyService.updateBuilding(
          editingBuilding.id,
          payload
        );

        toast.success("Building updated successfully.");
      } else {
        result = await propertyService.createBuilding(
          selectedProject.id,
          payload
        );

        toast.success("Building created successfully.");
      }

      await loadBuildings(
        editingBuilding?.project_id ||
          selectedProject?.id
      );

      setSelectedBuilding(result);
      setBuildingModalOpen(false);
    } catch (error) {
      console.error("Save building error:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Unable to save building."
      );
    } finally {
      setSavingBuilding(false);
    }
  };

  // ============================================================
  // UNIT SUBMIT
  // ============================================================

  const handleUnitSubmit = async (event) => {
    event.preventDefault();

    if (!validateUnit()) {
      return;
    }

    if (!selectedBuilding && !editingUnit) {
      toast.error("Please select a building first.");
      return;
    }

    try {
      setSavingUnit(true);

      const payload = {
        unit_number: unitForm.unit_number.trim(),
        type: unitForm.type,
        price: Number(unitForm.price),
        status: unitForm.status,
      };

      if (editingUnit) {
        await propertyService.updateUnit(
          editingUnit.id,
          payload
        );

        toast.success("Unit updated successfully.");
      } else {
        await propertyService.createUnit(
          selectedBuilding.id,
          payload
        );

        toast.success("Unit created successfully.");
      }

      await loadUnits(
        editingUnit?.building_id ||
          selectedBuilding?.id
      );

      setUnitModalOpen(false);
    } catch (error) {
      console.error("Save unit error:", error);

      if (error?.response?.status === 409) {
        setUnitFormErrors((previous) => ({
          ...previous,
          unit_number:
            error?.response?.data?.detail ||
            "A unit with this number already exists in this building.",
        }));

        return;
      }

      toast.error(
        error?.response?.data?.detail ||
          "Unable to save unit."
      );
    } finally {
      setSavingUnit(false);
    }
  };

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (loadingProjects) {
    return (
      <div className="page-container">
        <PageLoading message="Loading property portfolio..." />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="page-container space-y-6">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Property Portfolio
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Properties
          </h1>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Manage projects, buildings, inventory, pricing,
            and unit availability from one place.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateProject}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        )}
      </div>

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search projects, buildings or units..."
              className="input h-11 pl-10"
            />
          </div>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          PROJECT ERROR
      ======================================================== */}

      {projectsError && (
        <PageError
          message={projectsError}
          onRetry={loadProjects}
        />
      )}

      {/* ========================================================
          EMPTY PORTFOLIO
      ======================================================== */}

      {!projectsError && projects.length === 0 ? (
        <PageEmpty
          title="No projects yet"
          message="Create your first real estate project to start adding buildings and units."
          action={
            isAdmin ? (
              <button
                type="button"
                onClick={openCreateProject}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            ) : null
          }
        />
      ) : (
        <>
          {/* ======================================================
              INVENTORY KPIs
          ====================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InventoryCard
              icon={<FolderKanban className="h-5 w-5" />}
              label="Projects"
              value={projects.length}
              description="Property projects"
            />

            <InventoryCard
              icon={<Building2 className="h-5 w-5" />}
              label="Buildings"
              value={buildings.length}
              description={
                selectedProject
                  ? `In ${selectedProject.name}`
                  : "Select a project"
              }
            />

            <InventoryCard
              icon={<Home className="h-5 w-5" />}
              label="Available Units"
              value={availableUnits}
              description={`${availabilityPercentage}% availability`}
            />

            <InventoryCard
              icon={<Sparkles className="h-5 w-5" />}
              label="Inventory Value"
              value={formatCompactCurrency(inventoryValue)}
              description={`${bookedUnits} booked units`}
            />
          </div>

          {/* ======================================================
              MAIN PORTFOLIO
          ====================================================== */}

          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            {/* ====================================================
                PROJECT SIDEBAR
            ==================================================== */}

            <section className="card overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Projects
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {filteredProjects.length}{" "}
                      {filteredProjects.length === 1
                        ? "project"
                        : "projects"}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="max-h-[620px] overflow-y-auto p-2">
                {filteredProjects.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Search className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No matching projects
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try a different search term.
                    </p>
                  </div>
                ) : (
                  filteredProjects.map((project) => {
                    const active =
                      selectedProject?.id === project.id;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => {
                          setSelectedProject(project);
                          setSelectedBuilding(null);
                          setSearch("");
                        }}
                        className={`group mb-1.5 w-full rounded-xl p-3.5 text-left transition ${
                          active
                            ? "bg-primary-50 ring-1 ring-primary-100"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-primary-100 text-primary-600"
                                : "bg-slate-100 text-slate-500 group-hover:bg-white"
                            }`}
                          >
                            <Building2 className="h-4.5 w-4.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-semibold ${
                                active
                                  ? "text-primary-900"
                                  : "text-slate-800"
                              }`}
                            >
                              {project.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {project.location}
                            </p>
                          </div>

                          <ChevronRight
                            className={`h-4 w-4 shrink-0 transition ${
                              active
                                ? "translate-x-0.5 text-primary-500"
                                : "text-slate-300 group-hover:text-slate-500"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* ====================================================
                MAIN CONTENT
            ==================================================== */}

            <div className="min-w-0 space-y-6">
              {/* ==================================================
                  PROJECT HERO
              ================================================== */}

              {selectedProject && (
                <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary-600" />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                          <Building2 className="h-7 w-7" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                              {selectedProject.name}
                            </h2>

                            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-700">
                              Project
                            </span>
                          </div>

                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            {selectedProject.location}
                          </p>

                          {selectedProject.description && (
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                              {selectedProject.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            openEditProject(selectedProject)
                          }
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit project
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* ==================================================
                  BUILDINGS
              ================================================== */}

              <section className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        Buildings
                      </h2>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                        {filteredBuildings.length}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Select a building to manage its inventory.
                    </p>
                  </div>

                  {isAdmin && selectedProject && (
                    <button
                      type="button"
                      onClick={openCreateBuilding}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4" />
                      Add Building
                    </button>
                  )}
                </div>

                {loadingBuildings ? (
                  <PageLoading message="Loading buildings..." />
                ) : buildingsError ? (
                  <PageError
                    message={buildingsError}
                    onRetry={() =>
                      selectedProject &&
                      loadBuildings(selectedProject.id)
                    }
                  />
                ) : filteredBuildings.length === 0 ? (
                  <PageEmpty
                    title="No buildings"
                    message="This project does not have any buildings yet."
                    action={
                      isAdmin && selectedProject ? (
                        <button
                          type="button"
                          onClick={openCreateBuilding}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                        >
                          <Plus className="h-4 w-4" />
                          Add Building
                        </button>
                      ) : null
                    }
                  />
                ) : (
                  <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBuildings.map((building) => {
                      const active =
                        selectedBuilding?.id === building.id;

                      return (
                        <div
                          key={building.id}
                          className={`group rounded-2xl border p-4 transition ${
                            active
                              ? "border-primary-300 bg-primary-50/60 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBuilding(building);
                              setSearch("");
                            }}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                  active
                                    ? "bg-primary-100 text-primary-600"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <Home className="h-5 w-5" />
                              </div>

                              <ChevronRight
                                className={`h-4 w-4 ${
                                  active
                                    ? "text-primary-500"
                                    : "text-slate-300 group-hover:text-slate-500"
                                }`}
                              />
                            </div>

                            <p className="mt-4 text-sm font-bold text-slate-900">
                              {building.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Building
                            </p>
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                openEditBuilding(building)
                              }
                              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-primary-600 transition hover:bg-primary-50 hover:text-primary-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit building
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ==================================================
                  UNITS
              ================================================== */}

              {selectedBuilding && (
                <section className="card overflow-hidden">
                  <div className="border-b border-slate-100">
                    <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                            <Home className="h-4 w-4" />
                          </div>

                          <h2 className="text-base font-bold text-slate-900">
                            {selectedBuilding.name}
                          </h2>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {filteredUnits.length} units
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs text-slate-500">
                          Inventory, pricing and availability.
                        </p>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={openCreateUnit}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-700"
                        >
                          <Plus className="h-4 w-4" />
                          Add Unit
                        </button>
                      )}
                    </div>

                    {/* Unit mini stats */}
                    {!loadingUnits &&
                      !unitsError &&
                      units.length > 0 && (
                        <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/50">
                          <MiniStat
                            label="Total"
                            value={units.length}
                          />

                          <MiniStat
                            label="Available"
                            value={availableUnits}
                            valueClass="text-emerald-600"
                          />

                          <MiniStat
                            label="Booked"
                            value={bookedUnits}
                            valueClass="text-blue-600"
                          />
                        </div>
                      )}
                  </div>

                  {loadingUnits ? (
                    <PageLoading message="Loading units..." />
                  ) : unitsError ? (
                    <PageError
                      message={unitsError}
                      onRetry={() =>
                        selectedBuilding &&
                        loadUnits(selectedBuilding.id)
                      }
                    />
                  ) : filteredUnits.length === 0 ? (
                    <PageEmpty
                      title="No units"
                      message={
                        search
                          ? "No units match your search."
                          : "This building does not have any units yet."
                      }
                      action={
                        isAdmin && !search ? (
                          <button
                            type="button"
                            onClick={openCreateUnit}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                          >
                            <Plus className="h-4 w-4" />
                            Add Unit
                          </button>
                        ) : null
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/70">
                            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                              Unit
                            </th>

                            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                              Type
                            </th>

                            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                              Price
                            </th>

                            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                              Status
                            </th>

                            {isAdmin && (
                              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                Action
                              </th>
                            )}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {filteredUnits.map((unit) => (
                            <tr
                              key={unit.id}
                              className="group transition hover:bg-slate-50/70"
                            >
                              <td className="whitespace-nowrap px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    <Home className="h-4 w-4" />
                                  </div>

                                  <div>
                                    <p className="font-bold text-slate-900">
                                      {unit.unit_number}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      Unit ID #{unit.id}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                                  {unit.type}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <p className="text-sm font-bold text-slate-900">
                                  ₹
                                  {Number(
                                    unit.price
                                  ).toLocaleString("en-IN")}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  Listed price
                                </p>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <Badge
                                  value={unit.status}
                                  type="status"
                                />
                              </td>

                              {isAdmin && (
                                <td className="whitespace-nowrap px-5 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditUnit(unit)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </>
      )}

      {/* ==========================================================
          PROJECT MODAL
      ========================================================== */}

      <Modal
        open={projectModalOpen}
        onClose={() => {
          if (!savingProject) {
            setProjectModalOpen(false);
          }
        }}
        title={
          editingProject
            ? "Edit Project"
            : "Create New Project"
        }
        description={
          editingProject
            ? "Update project information."
            : "Add a new property project."
        }
        size="lg"
      >
        <form
          onSubmit={handleProjectSubmit}
          noValidate
          className="space-y-5"
        >
          <FormField
            label="Project name"
            name="name"
            value={projectForm.name}
            onChange={handleProjectChange}
            placeholder="e.g. Green Valley Residency"
            error={projectErrors.name}
            required
          />

          <FormField
            label="Location"
            name="location"
            value={projectForm.location}
            onChange={handleProjectChange}
            placeholder="e.g. OMR, Chennai"
            error={projectErrors.location}
            required
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={projectForm.description}
              onChange={handleProjectChange}
              rows={4}
              placeholder="Add a short description about the project..."
              className="input resize-none"
            />
          </div>

          <ModalActions
            loading={savingProject}
            onCancel={() =>
              setProjectModalOpen(false)
            }
            loadingText={
              editingProject
                ? "Updating..."
                : "Creating..."
            }
            submitText={
              editingProject
                ? "Update Project"
                : "Create Project"
            }
          />
        </form>
      </Modal>

      {/* ==========================================================
          BUILDING MODAL
      ========================================================== */}

      <Modal
        open={buildingModalOpen}
        onClose={() => {
          if (!savingBuilding) {
            setBuildingModalOpen(false);
          }
        }}
        title={
          editingBuilding
            ? "Edit Building"
            : "Create New Building"
        }
        description={
          editingBuilding
            ? "Update building information."
            : selectedProject
              ? `Add a building to ${selectedProject.name}.`
              : "Add a building."
        }
        size="md"
      >
        <form
          onSubmit={handleBuildingSubmit}
          noValidate
          className="space-y-5"
        >
          <FormField
            label="Building name"
            name="name"
            value={buildingForm.name}
            onChange={handleBuildingChange}
            placeholder="e.g. Tower A"
            error={buildingErrors.name}
            required
          />

          <ModalActions
            loading={savingBuilding}
            onCancel={() =>
              setBuildingModalOpen(false)
            }
            loadingText={
              editingBuilding
                ? "Updating..."
                : "Creating..."
            }
            submitText={
              editingBuilding
                ? "Update Building"
                : "Create Building"
            }
          />
        </form>
      </Modal>

      {/* ==========================================================
          UNIT MODAL
      ========================================================== */}

      <Modal
        open={unitModalOpen}
        onClose={() => {
          if (!savingUnit) {
            setUnitModalOpen(false);
          }
        }}
        title={
          editingUnit
            ? "Edit Unit"
            : "Create New Unit"
        }
        description={
          editingUnit
            ? "Update unit information and availability."
            : selectedBuilding
              ? `Add a unit to ${selectedBuilding.name}.`
              : "Add a new property unit."
        }
        size="lg"
      >
        <form
          onSubmit={handleUnitSubmit}
          noValidate
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Unit number"
              name="unit_number"
              value={unitForm.unit_number}
              onChange={handleUnitChange}
              placeholder="e.g. A-101"
              error={unitFormErrors.unit_number}
              required
            />

            <SelectField
              label="Unit type"
              name="type"
              value={unitForm.type}
              onChange={handleUnitChange}
              options={unitTypes.map((type) => ({
                value: type,
                label: type,
              }))}
              error={unitFormErrors.type}
              required
            />

            <FormField
              label="Price"
              name="price"
              type="number"
              value={unitForm.price}
              onChange={handleUnitChange}
              placeholder="e.g. 7500000"
              error={unitFormErrors.price}
              required
              min="1"
              step="0.01"
            />

            <SelectField
              label="Status"
              name="status"
              value={unitForm.status}
              onChange={handleUnitChange}
              options={[
                {
                  value: "AVAILABLE",
                  label: "Available",
                },
                {
                  value: "BOOKED",
                  label: "Booked",
                },
              ]}
              error={unitFormErrors.status}
              required
            />
          </div>

          <ModalActions
            loading={savingUnit}
            onCancel={() =>
              setUnitModalOpen(false)
            }
            loadingText={
              editingUnit
                ? "Updating..."
                : "Creating..."
            }
            submitText={
              editingUnit
                ? "Update Unit"
                : "Create Unit"
            }
          />
        </form>
      </Modal>
    </div>
  );
}

// ============================================================
// INVENTORY CARD
// ============================================================

function InventoryCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          {icon}
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          CRM
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ============================================================
// MINI STAT
// ============================================================

function MiniStat({
  label,
  value,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="px-5 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-0.5 text-lg font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required: isRequired = false,
  min,
  step,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {isRequired && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        aria-invalid={Boolean(error)}
        className={`input ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : ""
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// SELECT FIELD
// ============================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required: isRequired = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {isRequired && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`input ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : ""
        }`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// MODAL ACTIONS
// ============================================================

function ModalActions({
  loading,
  onCancel,
  loadingText,
  submitText,
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}

        {loading ? loadingText : submitText}
      </button>
    </div>
  );
}

// ============================================================
// CURRENCY
// ============================================================

function formatCompactCurrency(value) {
  if (!value) {
    return "₹0";
  }

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}