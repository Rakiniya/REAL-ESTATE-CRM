import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  FolderKanban,
  Home,
  MapPin,
  Plus,
  Search,
  Pencil,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import propertyService from "../services/propertyService";
import { useAuth } from "../context/AuthContext";

const unitTypes = ["Apartment", "Villa", "Plot", "Office", "Shop"];

const emptyProject = {
  name: "",
  location: "",
  description: "",
};

const emptyBuilding = {
  name: "",
};

const emptyUnit = {
  unit_number: "",
  type: "Apartment",
  price: "",
  status: "AVAILABLE",
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function LoadingState({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary-600" />
      <span className="text-sm text-slate-500">{text}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function Properties() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [projectSearch, setProjectSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [unitStatusFilter, setUnitStatusFilter] = useState("ALL");

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);

  const [editingUnit, setEditingUnit] = useState(null);

  const [projectForm, setProjectForm] = useState(emptyProject);
  const [buildingForm, setBuildingForm] = useState(emptyBuilding);
  const [unitForm, setUnitForm] = useState(emptyUnit);

  const [saving, setSaving] = useState(false);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);

      const data = await propertyService.getProjects();
      setProjects(data);

      if (data.length > 0) {
        setSelectedProject((current) => {
          if (current) {
            return data.find((item) => item.id === current.id) || data[0];
          }

          return data[0];
        });
      } else {
        setSelectedProject(null);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to load properties."
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadBuildings = async (projectId) => {
    if (!projectId) {
      setBuildings([]);
      return;
    }

    try {
      setLoadingBuildings(true);

      const data = await propertyService.getBuildings(projectId);

      setBuildings(data);

      setSelectedBuilding((current) => {
        if (current) {
          return data.find((item) => item.id === current.id) || data[0] || null;
        }

        return data[0] || null;
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to load buildings."
      );
      setBuildings([]);
      setSelectedBuilding(null);
    } finally {
      setLoadingBuildings(false);
    }
  };

  const loadUnits = async (buildingId) => {
    if (!buildingId) {
      setUnits([]);
      return;
    }

    try {
      setLoadingUnits(true);

      const data = await propertyService.getUnits(buildingId);
      setUnits(data);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
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
    if (!selectedProject) {
      setBuildings([]);
      setSelectedBuilding(null);
      setUnits([]);
      return;
    }

    loadBuildings(selectedProject.id);
  }, [selectedProject?.id]);

  useEffect(() => {
    if (!selectedBuilding) {
      setUnits([]);
      return;
    }

    loadUnits(selectedBuilding.id);
  }, [selectedBuilding?.id]);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query)
    );
  }, [projects, projectSearch]);

  const filteredUnits = useMemo(() => {
    const query = unitSearch.trim().toLowerCase();

    return units.filter((unit) => {
      const matchesSearch =
        !query ||
        unit.unit_number.toLowerCase().includes(query) ||
        unit.type.toLowerCase().includes(query);

      const matchesStatus =
        unitStatusFilter === "ALL" ||
        unit.status === unitStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [units, unitSearch, unitStatusFilter]);

  const availableUnits = units.filter(
    (unit) => unit.status === "AVAILABLE"
  ).length;

  const bookedUnits = units.filter(
    (unit) => unit.status === "BOOKED"
  ).length;

  const openCreateProject = () => {
    setProjectForm(emptyProject);
    setProjectModalOpen(true);
  };

  const openCreateBuilding = () => {
    if (!selectedProject) {
      toast.error("Select a project first.");
      return;
    }

    setBuildingForm(emptyBuilding);
    setBuildingModalOpen(true);
  };

  const openCreateUnit = () => {
    if (!selectedBuilding) {
      toast.error("Select a building first.");
      return;
    }

    setEditingUnit(null);

    setUnitForm({
      unit_number: "",
      type: "Apartment",
      price: "",
      status: "AVAILABLE",
    });

    setUnitModalOpen(true);
  };

  const openEditUnit = (unit) => {
    setEditingUnit(unit);

    setUnitForm({
      unit_number: unit.unit_number,
      type: unit.type,
      price: unit.price,
      status: unit.status,
    });

    setUnitModalOpen(true);
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();

    if (!projectForm.name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    if (!projectForm.location.trim()) {
      toast.error("Project location is required.");
      return;
    }

    try {
      setSaving(true);

      const created = await propertyService.createProject({
        name: projectForm.name.trim(),
        location: projectForm.location.trim(),
        description: projectForm.description.trim() || null,
      });

      toast.success("Project created successfully.");

      setProjectModalOpen(false);
      setProjectForm(emptyProject);

      await loadProjects();

      setSelectedProject(created);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to create project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBuildingSubmit = async (event) => {
    event.preventDefault();

    if (!buildingForm.name.trim()) {
      toast.error("Building name is required.");
      return;
    }

    try {
      setSaving(true);

      const created = await propertyService.createBuilding(
        selectedProject.id,
        {
          name: buildingForm.name.trim(),
        }
      );

      toast.success("Building created successfully.");

      setBuildingModalOpen(false);
      setBuildingForm(emptyBuilding);

      await loadBuildings(selectedProject.id);

      setSelectedBuilding(created);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to create building."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUnitSubmit = async (event) => {
    event.preventDefault();

    if (!unitForm.unit_number.trim()) {
      toast.error("Unit number is required.");
      return;
    }

    if (!unitForm.type) {
      toast.error("Unit type is required.");
      return;
    }

    if (!unitForm.price || Number(unitForm.price) <= 0) {
      toast.error("Enter a valid unit price.");
      return;
    }

    try {
      setSaving(true);

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

      setUnitModalOpen(false);
      setEditingUnit(null);
      setUnitForm(emptyUnit);

      await loadUnits(selectedBuilding.id);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to save unit."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FolderKanban className="h-4 w-4" />
            <span>Property Management</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Properties
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage projects, buildings and available units.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateProject}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        )}
      </div>

      {/* Main layout */}
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Projects */}
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Projects
                </h2>
                <p className="text-xs text-slate-500">
                  {projects.length} project
                  {projects.length === 1 ? "" : "s"}
                </p>
              </div>

              <FolderKanban className="h-5 w-5 text-slate-400" />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={projectSearch}
                onChange={(event) =>
                  setProjectSearch(event.target.value)
                }
                placeholder="Search projects..."
                className="input pl-9"
              />
            </div>
          </div>

          <div className="max-h-[650px] overflow-y-auto p-2">
            {loadingProjects ? (
              <LoadingState text="Loading projects..." />
            ) : filteredProjects.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={FolderKanban}
                  title="No projects found"
                  description={
                    projectSearch
                      ? "Try a different search."
                      : "Create your first property project."
                  }
                />
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
                      setUnits([]);
                    }}
                    className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-primary-50 ring-1 ring-primary-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-semibold ${
                          active
                            ? "text-primary-700"
                            : "text-slate-800"
                        }`}
                      >
                        {project.name}
                      </p>

                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {project.location}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`ml-2 h-4 w-4 shrink-0 ${
                        active
                          ? "text-primary-600"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Property details */}
        <section className="space-y-6">
          {!selectedProject ? (
            <EmptyState
              icon={Building2}
              title="Select a project"
              description="Choose a project from the left to view its buildings and units."
            />
          ) : (
            <>
              {/* Project overview */}
              <div className="card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-primary-50 p-2">
                        <Building2 className="h-5 w-5 text-primary-600" />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedProject.name}
                        </h2>

                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          {selectedProject.location}
                        </div>
                      </div>
                    </div>

                    {selectedProject.description && (
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                        {selectedProject.description}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={openCreateBuilding}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Building
                    </button>
                  )}
                </div>
              </div>

              {/* Buildings */}
              <div className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Buildings
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Select a building to view its units.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {buildings.length} building
                    {buildings.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="p-4">
                  {loadingBuildings ? (
                    <LoadingState text="Loading buildings..." />
                  ) : buildings.length === 0 ? (
                    <EmptyState
                      icon={Building2}
                      title="No buildings yet"
                      description={
                        isAdmin
                          ? "Add a building to start managing units."
                          : "No buildings have been added to this project yet."
                      }
                    />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {buildings.map((building) => {
                        const active =
                          selectedBuilding?.id === building.id;

                        return (
                          <button
                            key={building.id}
                            type="button"
                            onClick={() =>
                              setSelectedBuilding(building)
                            }
                            className={`rounded-xl border p-4 text-left transition ${
                              active
                                ? "border-primary-200 bg-primary-50 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`rounded-lg p-2 ${
                                  active
                                    ? "bg-white"
                                    : "bg-slate-50"
                                }`}
                              >
                                <Building2
                                  className={`h-5 w-5 ${
                                    active
                                      ? "text-primary-600"
                                      : "text-slate-500"
                                  }`}
                                />
                              </div>

                              <ChevronRight className="h-4 w-4 text-slate-300" />
                            </div>

                            <h3
                              className={`mt-3 text-sm font-semibold ${
                                active
                                  ? "text-primary-700"
                                  : "text-slate-800"
                              }`}
                            >
                              {building.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Building #{building.id}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Units */}
              <div className="card overflow-hidden">
                <div className="border-b border-slate-100 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-slate-500" />

                        <h2 className="font-semibold text-slate-900">
                          {selectedBuilding
                            ? `${selectedBuilding.name} Units`
                            : "Units"}
                        </h2>
                      </div>

                      {selectedBuilding && (
                        <p className="mt-1 text-xs text-slate-500">
                          {availableUnits} available · {bookedUnits} booked
                        </p>
                      )}
                    </div>

                    {isAdmin && selectedBuilding && (
                      <button
                        type="button"
                        onClick={openCreateUnit}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add Unit
                      </button>
                    )}
                  </div>

                  {selectedBuilding && (
                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          value={unitSearch}
                          onChange={(event) =>
                            setUnitSearch(event.target.value)
                          }
                          placeholder="Search unit number or type..."
                          className="input pl-9"
                        />
                      </div>

                      <select
                        value={unitStatusFilter}
                        onChange={(event) =>
                          setUnitStatusFilter(event.target.value)
                        }
                        className="input"
                      >
                        <option value="ALL">All statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="BOOKED">Booked</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  {!selectedBuilding ? (
                    <div className="p-5">
                      <EmptyState
                        icon={Home}
                        title="Select a building"
                        description="Choose a building above to see its units."
                      />
                    </div>
                  ) : loadingUnits ? (
                    <LoadingState text="Loading units..." />
                  ) : filteredUnits.length === 0 ? (
                    <div className="p-5">
                      <EmptyState
                        icon={Home}
                        title="No units found"
                        description={
                          units.length === 0
                            ? "No units have been added to this building yet."
                            : "Try changing your search or status filter."
                        }
                      />
                    </div>
                  ) : (
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Unit
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Type
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Price
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Status
                          </th>

                          {isAdmin && (
                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Action
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredUnits.map((unit) => (
                          <tr
                            key={unit.id}
                            className="transition hover:bg-slate-50/60"
                          >
                            <td className="whitespace-nowrap px-5 py-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {unit.unit_number}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  ID #{unit.id}
                                </p>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                              {unit.type}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800">
                              {formatPrice(unit.price)}
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
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Create Project Modal */}
      <Modal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title="Create Project"
        description="Add a new real estate project."
      >
        <form
          onSubmit={handleProjectSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Project Name
            </label>

            <input
              value={projectForm.name}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  name: event.target.value,
                })
              }
              placeholder="e.g. Green Valley Residency"
              className="input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Location
            </label>

            <input
              value={projectForm.location}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  location: event.target.value,
                })
              }
              placeholder="e.g. Chennai, Tamil Nadu"
              className="input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              rows={4}
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  description: event.target.value,
                })
              }
              placeholder="Brief description of the project..."
              className="input resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setProjectModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Building Modal */}
      <Modal
        open={buildingModalOpen}
        onClose={() => setBuildingModalOpen(false)}
        title="Add Building"
        description={
          selectedProject
            ? `Add a building to ${selectedProject.name}.`
            : "Add a building."
        }
      >
        <form
          onSubmit={handleBuildingSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Building Name
            </label>

            <input
              value={buildingForm.name}
              onChange={(event) =>
                setBuildingForm({
                  ...buildingForm,
                  name: event.target.value,
                })
              }
              placeholder="e.g. Tower A"
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setBuildingModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Building"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Unit Modal */}
      <Modal
        open={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        title={editingUnit ? "Edit Unit" : "Add Unit"}
        description={
          selectedBuilding
            ? `${editingUnit ? "Update" : "Create"} a unit in ${selectedBuilding.name}.`
            : "Manage property unit."
        }
      >
        <form
          onSubmit={handleUnitSubmit}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Unit Number
              </label>

              <input
                value={unitForm.unit_number}
                onChange={(event) =>
                  setUnitForm({
                    ...unitForm,
                    unit_number: event.target.value,
                  })
                }
                placeholder="e.g. A-101"
                className="input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Unit Type
              </label>

              <select
                value={unitForm.type}
                onChange={(event) =>
                  setUnitForm({
                    ...unitForm,
                    type: event.target.value,
                  })
                }
                className="input"
              >
                {unitTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Price
              </label>

              <input
                type="number"
                min="1"
                value={unitForm.price}
                onChange={(event) =>
                  setUnitForm({
                    ...unitForm,
                    price: event.target.value,
                  })
                }
                placeholder="e.g. 8500000"
                className="input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={unitForm.status}
                onChange={(event) =>
                  setUnitForm({
                    ...unitForm,
                    status: event.target.value,
                  })
                }
                className="input"
              >
                <option value="AVAILABLE">Available</option>
                <option value="BOOKED">Booked</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setUnitModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingUnit
                ? "Update Unit"
                : "Create Unit"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}