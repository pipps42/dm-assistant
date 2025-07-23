import React, { useEffect, useState } from "react";
import {
  AppShell,
  AppHeader,
  Sidebar,
  SidebarItem,
  SidebarGroup,
  Button,
  Modal,
  Input,
  TextArea,
  Loading,
  Alert,
  Tabs,
  TabsList,
  Tab,
  TabsContent,
  Breadcrumbs,
  Select,
  Toast,
  ToolPanel,
  ToolPanelProvider,
} from "@/shared/components/ui";
import { CampaignCard } from "@/shared/components/dnd/CampaignCard";
// import { StatsCard } from "@/shared/components/ui/StatsCard";
import { useCampaign } from "@/shared/hooks/dnd/useCampaign";
import {
  Campaign,
  CreateCampaignRequest,
  CampaignStatus,
  DifficultyLevel,
  COMMON_SETTINGS,
  DIFFICULTY_LEVELS,
  DIFFICULTY_LABELS,
} from "@/core/entities/Campaign";

// ================================================================
// CAMPAIGN DASHBOARD PAGE
// ================================================================

const CampaignDashboard: React.FC = () => {
  const {
    campaigns,
    currentCampaign,
    campaignSummaries,
    recentCampaigns,
    loading,
    error,
    createCampaign,
    loadAllCampaigns,
    loadRecentCampaigns,
    setCurrentCampaign,
    deleteCampaign,
    archiveCampaign,
    duplicateCampaign,
    clearError,
  } = useCampaign();

  // Local state for modals and forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [createForm, setCreateForm] = useState<CreateCampaignRequest>({
    name: "",
    description: "",
    playerCount: 5,
    difficultyLevel: "Normal" as DifficultyLevel,
    setting: "D&D 5e",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadAllCampaigns();
    loadRecentCampaigns();
  }, [loadAllCampaigns, loadRecentCampaigns]);

  // Calculate stats
  const activeCampaigns = campaigns.filter((c) => c.status === "Active");
  const totalSessions = campaigns.reduce(
    (sum, c) => sum + (c.info.totalSessions || 0),
    0
  );
  const totalCharacters = campaigns.reduce(
    (sum, c) => sum + (c.activeCharacters || 0),
    0
  );
  const avgLevel =
    totalCharacters > 0
      ? Math.round(
          campaigns.reduce((sum, c) => sum + (c.averageLevel || 1), 0) /
            campaigns.length
        )
      : 1;

  // Navigation items
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <span>📊</span>,
      isActive: true,
    },
    {
      id: "campaigns",
      label: "Campaigns",
      icon: <span>🏰</span>,
      children: [
        { id: "active", label: "Active", icon: <span>🎲</span> },
        { id: "paused", label: "Paused", icon: <span>⏸️</span> },
        { id: "completed", label: "Completed", icon: <span>✅</span> },
        { id: "archived", label: "Archived", icon: <span>📦</span> },
      ],
    },
    {
      id: "tools",
      label: "DM Tools",
      icon: <span>🛠️</span>,
      children: [
        { id: "dice", label: "Dice Roller", icon: <span>🎲</span> },
        { id: "combat", label: "Combat Tracker", icon: <span>⚔️</span> },
        { id: "bestiary", label: "Bestiary", icon: <span>🐉</span> },
      ],
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { id: "home", label: "DM Assistant", href: "/" },
    { id: "dashboard", label: "Dashboard" },
  ];

  // Handle create campaign
  const handleCreateCampaign = async () => {
    try {
      const newCampaign = await createCampaign(createForm);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        description: "",
        playerCount: 5,
        difficultyLevel: "Normal",
        setting: "D&D 5e",
      });
      setToastMessage(`Campaign "${newCampaign.name}" created successfully!`);
      setShowToast(true);
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  // Handle delete campaign
  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      await deleteCampaign(campaignToDelete.id);
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      setToastMessage(
        `Campaign "${campaignToDelete.name}" deleted successfully!`
      );
      setShowToast(true);
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    }
  };

  // Handle campaign actions
  const handleSwitchToCampaign = async (campaignId: string) => {
    try {
      await setCurrentCampaign(campaignId);
      setToastMessage("Switched to campaign successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Failed to switch campaign:", error);
    }
  };

  const handleDuplicateCampaign = async (
    campaignId: string,
    originalName: string
  ) => {
    try {
      const newName = `${originalName} (Copy)`;
      await duplicateCampaign(campaignId, newName);
      setToastMessage(`Campaign duplicated as "${newName}"!`);
      setShowToast(true);
    } catch (error) {
      console.error("Failed to duplicate campaign:", error);
    }
  };

  const handleArchiveCampaign = async (campaignId: string) => {
    try {
      await archiveCampaign(campaignId);
      setToastMessage("Campaign archived successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Failed to archive campaign:", error);
    }
  };

  // Filter campaigns by status
  const getFilteredCampaigns = (status?: CampaignStatus) => {
    if (!status) return campaigns;
    return campaigns.filter((c) => c.status === status);
  };

  if (loading && campaigns.length === 0) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" text="Loading campaigns..." />
        </div>
      </AppShell>
    );
  }

  return (
    <ToolPanelProvider>
      <AppShell
        sidebar={
          <Sidebar>
            <SidebarGroup
              group={{
                id: "main-nav",
                items: navigationItems,
              }}
            />
          </Sidebar>
        }
        header={
          <AppHeader
            breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
            title="Campaign Dashboard"
            subtitle={
              currentCampaign
                ? `Current: ${currentCampaign.name}`
                : "No active campaign"
            }
            actions={
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<span>➕</span>}
                >
                  New Campaign
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Open dice roller tool panel
                  }}
                  leftIcon={<span>🎲</span>}
                >
                  Quick Tools
                </Button>
              </div>
            }
          />
        }
      >
        {/* Error Alert */}
        {error && (
          <Alert
            variant="error"
            title="Error"
            onDismiss={clearError}
            className="mb-6"
          >
            {error}
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          <TabsList>
            <Tab id="overview">Overview</Tab>
            <Tab id="active">Active Campaigns</Tab>
            <Tab id="all">All Campaigns</Tab>
            <Tab id="archived">Archived</Tab>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent id="overview">
            <div className="space-y-6">
              {/* Stats Grid */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Campaigns"
                  value={campaigns.length}
                  icon={<span>🏰</span>}
                  variant="primary"
                  tooltip="Total number of campaigns"
                />
                <StatsCard
                  title="Active Campaigns"
                  value={activeCampaigns.length}
                  icon={<span>🎲</span>}
                  variant="success"
                  tooltip="Currently active campaigns"
                />
                <StatsCard
                  title="Total Sessions"
                  value={totalSessions}
                  icon={<span>📅</span>}
                  variant="info"
                  tooltip="Total sessions played across all campaigns"
                />
                <StatsCard
                  title="Average Level"
                  value={avgLevel}
                  icon={<span>⭐</span>}
                  variant="warning"
                  tooltip="Average character level across all campaigns"
                />
              </div> */}

              {/* Recent Campaigns */}
              {recentCampaigns.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Recent Campaigns
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentCampaigns.slice(0, 6).map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        isActive={currentCampaign?.id === campaign.id}
                        onSwitchTo={() => handleSwitchToCampaign(campaign.id)}
                        onEdit={() => {
                          /* TODO: Implement edit */
                        }}
                        onDelete={() => {
                          setCampaignToDelete(campaign);
                          setShowDeleteModal(true);
                        }}
                        onDuplicate={() =>
                          handleDuplicateCampaign(campaign.id, campaign.name)
                        }
                        onArchive={() => handleArchiveCampaign(campaign.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <span className="text-2xl mb-2">🆕</span>
                    Create New Campaign
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col"
                    disabled={!currentCampaign}
                  >
                    <span className="text-2xl mb-2">⚔️</span>
                    Start Combat
                  </Button>
                  <Button variant="outline" size="lg" className="h-20 flex-col">
                    <span className="text-2xl mb-2">📖</span>
                    Browse Bestiary
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Active Campaigns Tab */}
          <TabsContent id="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredCampaigns("Active").map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  variant="detailed"
                  isActive={currentCampaign?.id === campaign.id}
                  onSwitchTo={() => handleSwitchToCampaign(campaign.id)}
                  onEdit={() => {
                    /* TODO: Implement edit */
                  }}
                  onDelete={() => {
                    setCampaignToDelete(campaign);
                    setShowDeleteModal(true);
                  }}
                  onDuplicate={() =>
                    handleDuplicateCampaign(campaign.id, campaign.name)
                  }
                  onArchive={() => handleArchiveCampaign(campaign.id)}
                />
              ))}
              {getFilteredCampaigns("Active").length === 0 && (
                <div className="col-span-full text-center py-12">
                  <span className="text-4xl mb-4 block">🎲</span>
                  <h3 className="text-lg font-semibold mb-2">
                    No Active Campaigns
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first campaign to get started!
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Campaign
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Campaigns Tab */}
          <TabsContent id="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  isActive={currentCampaign?.id === campaign.id}
                  onSwitchTo={() => handleSwitchToCampaign(campaign.id)}
                  onEdit={() => {
                    /* TODO: Implement edit */
                  }}
                  onDelete={() => {
                    setCampaignToDelete(campaign);
                    setShowDeleteModal(true);
                  }}
                  onDuplicate={() =>
                    handleDuplicateCampaign(campaign.id, campaign.name)
                  }
                  onArchive={() => handleArchiveCampaign(campaign.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Archived Campaigns Tab */}
          <TabsContent id="archived">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredCampaigns("Archived").map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  variant="compact"
                  onDelete={() => {
                    setCampaignToDelete(campaign);
                    setShowDeleteModal(true);
                  }}
                  onDuplicate={() =>
                    handleDuplicateCampaign(campaign.id, campaign.name)
                  }
                />
              ))}
              {getFilteredCampaigns("Archived").length === 0 && (
                <div className="col-span-full text-center py-12">
                  <span className="text-4xl mb-4 block">📦</span>
                  <h3 className="text-lg font-semibold mb-2">
                    No Archived Campaigns
                  </h3>
                  <p className="text-gray-600">
                    Archived campaigns will appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Campaign Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Campaign"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Campaign Name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter campaign name"
              required
            />
            <TextArea
              label="Description"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of the campaign"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Players"
                type="number"
                value={createForm.playerCount}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    playerCount: parseInt(e.target.value) || 6,
                  }))
                }
                min={1}
                max={8}
              />
              <Select
                label="Difficulty"
                value={createForm.difficultyLevel}
                onChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    difficultyLevel: value as DifficultyLevel,
                  }))
                }
                options={DIFFICULTY_LEVELS.map((level) => ({
                  value: level,
                  label: DIFFICULTY_LABELS[level],
                }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateCampaign}
                disabled={!createForm.name.trim()}
              >
                Create Campaign
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Campaign"
          size="sm"
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to delete{" "}
              <strong>"{campaignToDelete?.name}"</strong>? This action cannot be
              undone and all campaign data will be lost.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteCampaign}>
                Delete Campaign
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast Notification */}
        {showToast && (
          <Toast
            message={toastMessage}
            variant="success"
            onClose={() => setShowToast(false)}
            isVisible
          />
        )}
      </AppShell>
    </ToolPanelProvider>
  );
};

export default CampaignDashboard;
