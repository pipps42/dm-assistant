import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  SuccessButton,
  DangerButton,
  GhostButton,
  CreateButton,
  EditButton,
  DeleteButton,
  SaveButton,
  CancelButton,
  RefreshButton,
  LevelUpButton,
  CombatButton,
  SocialButton,
  DiceButton,
  AchievementButton,
  RelationshipButton,
} from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Fields/Input";
import { TextArea } from "@/shared/components/ui/Fields/TextArea";
import {
  Card,
  FeatureCard,
  StatsCard,
  ImageCard,
  ToolCard,
  CharacterPreviewCard,
  CampaignCard,
} from "@/shared/components/ui/Card";
import {
  Modal,
  ConfirmModal,
  FormModal,
  CharacterFormModal,
  DeleteConfirmModal,
  ImagePreviewModal,
} from "@/shared/components/ui/Modal";

const DemoComponentsPage: React.FC = () => {
  // Modal states
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Component demo values
  const [inputValue, setInputValue] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");

  const ComponentSection: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold text-primary mb-8 border-b border-primary pb-4">
        {title}
      </h2>
      {children}
    </section>
  );

  const DemoGroup: React.FC<{
    title: string;
    children: React.ReactNode;
    description?: string;
  }> = ({ title, children, description }) => (
    <div className="mb-12">
      <h3 className="text-lg font-medium text-secondary mb-4">{title}</h3>
      {description && (
        <p className="text-sm text-tertiary mb-6">{description}</p>
      )}
      <Card className="p-6">{children}</Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="surface-primary border-b border-primary sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Componenti UI</h1>
              <p className="text-secondary mt-2">
                Showcase completo di tutti i componenti con varianti e stati
              </p>
            </div>
            <Link to="/">
              <SecondaryButton>← Torna alla Home</SecondaryButton>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Button Components */}
        <ComponentSection title="Button Components">
          {/* Basic Variants */}
          <DemoGroup
            title="Varianti Base"
            description="Le varianti principali del sistema di button con i loro colori semantici"
          >
            <div className="flex gap-4 flex-wrap">
              <PrimaryButton>Primary</PrimaryButton>
              <SecondaryButton>Secondary</SecondaryButton>
              <SuccessButton>Success</SuccessButton>
              <Button variant="warning">Warning</Button>
              <DangerButton>Danger</DangerButton>
              <Button variant="info">Info</Button>
              <GhostButton>Ghost</GhostButton>
            </div>
          </DemoGroup>

          {/* Sizes */}
          <DemoGroup
            title="Dimensioni"
            description="Tre dimensioni standard per adattarsi a diversi contesti di utilizzo"
          >
            <div className="flex gap-4 items-center flex-wrap">
              <PrimaryButton size="sm">Small</PrimaryButton>
              <PrimaryButton size="md">Medium</PrimaryButton>
              <PrimaryButton size="lg">Large</PrimaryButton>
            </div>
          </DemoGroup>

          {/* With Icons */}
          <DemoGroup
            title="Con Icone"
            description="Button con icone a sinistra, destra, o solo icone"
          >
            <div className="flex gap-4 flex-wrap">
              <PrimaryButton leftIcon={<span>📁</span>}>
                Icona Sinistra
              </PrimaryButton>
              <SecondaryButton rightIcon={<span>→</span>}>
                Icona Destra
              </SecondaryButton>
              <Button
                variant="success"
                leftIcon={<span>✓</span>}
                rightIcon={<span>💾</span>}
              >
                Entrambe
              </Button>
              <Button variant="ghost" leftIcon={<span>🔄</span>} size="sm">
                Refresh
              </Button>
            </div>
          </DemoGroup>

          {/* States */}
          <DemoGroup
            title="Stati"
            description="Stati interattivi: normale, loading, disabilitato"
          >
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <PrimaryButton>Normale</PrimaryButton>
                <PrimaryButton loading>Loading</PrimaryButton>
                <PrimaryButton disabled>Disabilitato</PrimaryButton>
              </div>
              <div className="flex gap-4 flex-wrap">
                <SecondaryButton>Normale</SecondaryButton>
                <SecondaryButton loading>Loading</SecondaryButton>
                <SecondaryButton disabled>Disabilitato</SecondaryButton>
              </div>
            </div>
          </DemoGroup>

          {/* D&D Preset Buttons */}
          <DemoGroup
            title="Preset D&D"
            description="Button predefiniti per azioni comuni nei tool D&D"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-tertiary">
                  CRUD Actions
                </h4>
                <div className="space-y-2">
                  <CreateButton size="sm">Crea</CreateButton>
                  <EditButton size="sm">Modifica</EditButton>
                  <DeleteButton size="sm">Elimina</DeleteButton>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-tertiary">
                  Form Actions
                </h4>
                <div className="space-y-2">
                  <SaveButton size="sm">Salva</SaveButton>
                  <CancelButton size="sm">Annulla</CancelButton>
                  <RefreshButton size="sm">Aggiorna</RefreshButton>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-tertiary">
                  Game Actions
                </h4>
                <div className="space-y-2">
                  <LevelUpButton size="sm">Level Up</LevelUpButton>
                  <CombatButton size="sm">Combatti</CombatButton>
                  <DiceButton size="sm">Lancia Dadi</DiceButton>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-tertiary">Social</h4>
                <div className="space-y-2">
                  <SocialButton size="sm">Chat</SocialButton>
                  <AchievementButton size="sm">Achievement</AchievementButton>
                  <RelationshipButton size="sm">Relazioni</RelationshipButton>
                </div>
              </div>
            </div>
          </DemoGroup>
        </ComponentSection>

        {/* Input Components */}
        <ComponentSection title="Input Components">
          {/* Basic Inputs */}
          <DemoGroup
            title="Input Base"
            description="Input con label, placeholder, helper text e gestione stati"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Nome"
                placeholder="Inserisci il nome..."
                helperText="Nome del personaggio o NPC"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="esempio@email.com"
                required
              />
            </div>
          </DemoGroup>

          {/* Input Variants */}
          <DemoGroup
            title="Varianti"
            description="Diversi stili visivi per adattarsi al contesto"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <Input
                label="Outlined (default)"
                variant="outlined"
                placeholder="Stile outlined"
              />
              <Input
                label="Filled"
                variant="filled"
                placeholder="Stile filled"
              />
              <Input label="Ghost" variant="ghost" placeholder="Stile ghost" />
            </div>
          </DemoGroup>

          {/* Input Sizes */}
          <DemoGroup
            title="Dimensioni"
            description="Tre dimensioni per diversi contesti di utilizzo"
          >
            <div className="space-y-4">
              <Input size="sm" placeholder="Small input" />
              <Input size="md" placeholder="Medium input (default)" />
              <Input size="lg" placeholder="Large input" />
            </div>
          </DemoGroup>

          {/* Input States */}
          <DemoGroup
            title="Stati"
            description="Stati visivi per feedback utente e validazione"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Successo"
                state="success"
                defaultValue="Validato correttamente"
                rightIcon={<span>✓</span>}
              />
              <Input
                label="Errore"
                state="error"
                errorText="Questo campo è obbligatorio"
                defaultValue=""
              />
              <Input
                label="Warning"
                state="warning"
                helperText="Controlla questo valore"
                defaultValue="Valore sospetto"
              />
              <Input
                label="Disabilitato"
                disabled
                defaultValue="Campo disabilitato"
              />
            </div>
          </DemoGroup>

          {/* Input with Icons */}
          <DemoGroup
            title="Con Icone"
            description="Input con icone decorative o funzionali"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Cerca"
                placeholder="Cerca personaggi..."
                leftIcon={<span>🔍</span>}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Password sicura"
                rightIcon={<span>👁️</span>}
              />
              <Input
                label="Caricamento"
                placeholder="Elaborazione..."
                loading
              />
              <Input
                label="Punti Esperienza"
                type="number"
                placeholder="0"
                leftIcon={<span>⭐</span>}
                rightIcon={<span>XP</span>}
              />
            </div>
          </DemoGroup>
        </ComponentSection>

        {/* TextArea Components */}
        <ComponentSection title="TextArea Components">
          {/* Basic TextArea */}
          <DemoGroup
            title="TextArea Base"
            description="Area di testo multi-riga con supporto per ridimensionamento"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <TextArea
                label="Descrizione"
                placeholder="Inserisci una descrizione dettagliata..."
                helperText="Descrivi il background del personaggio"
                value={textAreaValue}
                onChange={(e) => setTextAreaValue(e.target.value)}
                minRows={3}
              />
              <TextArea
                label="Note Sessione"
                placeholder="Appunti della sessione..."
                showCharacterCount
                maxLength={500}
                defaultValue="Il party ha esplorato la caverna misteriosa..."
              />
            </div>
          </DemoGroup>

          {/* TextArea Variants */}
          <DemoGroup
            title="Varianti e Dimensioni"
            description="Diversi stili e dimensioni per vari contesti"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <TextArea
                  variant="outlined"
                  placeholder="Outlined style"
                  size="sm"
                  minRows={2}
                />
                <TextArea
                  variant="filled"
                  placeholder="Filled style"
                  size="md"
                  minRows={2}
                />
                <TextArea
                  variant="ghost"
                  placeholder="Ghost style"
                  size="lg"
                  minRows={2}
                />
              </div>
            </div>
          </DemoGroup>

          {/* TextArea Advanced Features */}
          <DemoGroup
            title="Funzionalità Avanzate"
            description="Auto-resize, conteggio caratteri, e altre funzionalità"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <TextArea
                label="Auto Resize"
                placeholder="Questo TextArea si ridimensiona automaticamente..."
                autoResize
                minRows={2}
                maxRows={6}
              />
              <TextArea
                label="Limite Caratteri"
                placeholder="Massimo 200 caratteri..."
                showCharacterCount
                maxLength={200}
                helperText="Breve descrizione"
              />
            </div>
          </DemoGroup>
        </ComponentSection>

        {/* Card Components */}
        <ComponentSection title="Card Components">
          {/* Basic Cards */}
          <DemoGroup
            title="Card Base"
            description="Card con diverse varianti e dimensioni"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <Card variant="default" size="sm">
                <h4 className="font-medium mb-2">Default Card</h4>
                <p className="text-secondary text-sm">
                  Card con stile default e dimensione small.
                </p>
              </Card>

              <Card variant="elevated" size="md">
                <h4 className="font-medium mb-2">Elevated Card</h4>
                <p className="text-secondary text-sm">
                  Card con ombra elevata per dare profondità.
                </p>
              </Card>

              <Card variant="outlined" size="lg">
                <h4 className="font-medium mb-2">Outlined Card</h4>
                <p className="text-secondary text-sm">
                  Card con bordo pronunciato senza ombra.
                </p>
              </Card>
            </div>
          </DemoGroup>

          {/* Interactive Cards */}
          <DemoGroup
            title="Card Interattive"
            description="Card cliccabili con stati hover e ghost"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                variant="interactive"
                clickable
                onClick={() => console.log("Card clicked!")}
              >
                <h4 className="font-medium mb-2">Card Cliccabile</h4>
                <p className="text-secondary text-sm">
                  Questa card è cliccabile e mostra effetti hover.
                </p>
              </Card>

              <Card variant="ghost">
                <h4 className="font-medium mb-2">Ghost Card</h4>
                <p className="text-secondary text-sm">
                  Card con stile fantasma, più sottile.
                </p>
              </Card>
            </div>
          </DemoGroup>

          {/* Specialized Cards */}
          <DemoGroup
            title="Card Specializzate"
            description="Card predefinite per casi d'uso specifici D&D"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="Combat Tracker"
                description="Gestisci iniziativa, HP e condizioni durante il combattimento"
                icon={<span className="text-2xl">⚔️</span>}
                status="new"
                action={<PrimaryButton size="sm">Apri Tool</PrimaryButton>}
              />

              <StatsCard
                title="Sessioni Attive"
                value="8"
                subtitle="Questo mese"
                icon={<span className="text-xl">📊</span>}
                trend="up"
                trendValue="+25%"
              />

              <ToolCard
                name="Bestiario"
                description="Gestisci mostri e calcola Challenge Rating"
                icon={<span className="text-2xl">🐉</span>}
                onClick={() => console.log("Bestiario!")}
                category="combat"
              />

              <CharacterPreviewCard
                name="Aranel Moonwhisper"
                race="Elfo"
                class="Ranger"
                level={5}
                hp={42}
                isActive={true}
                onClick={() => console.log("Character!")}
              />

              <CampaignCard
                name="Curse of Strahd"
                description="Una campagna horror gotica ambientata in Barovia"
                playerCount={4}
                lastPlayed="2 giorni fa"
                isActive={true}
                onClick={() => console.log("Campaign!")}
                onEdit={() => console.log("Edit campaign!")}
              />

              <ImageCard
                image="/api/placeholder/300/200"
                imageAlt="Mappa del dungeon"
                title="Dungeon delle Profondità"
                description="Mappa dettagliata del complesso sotterraneo"
                action={<SecondaryButton size="sm">Visualizza</SecondaryButton>}
              />
            </div>
          </DemoGroup>
        </ComponentSection>

        {/* Modal Components */}
        <ComponentSection title="Modal Components">
          {/* Modal Triggers */}
          <DemoGroup
            title="Tipi di Modal"
            description="Diversi tipi di modal per varie situazioni"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SecondaryButton onClick={() => setShowBasicModal(true)}>
                Modal Base
              </SecondaryButton>
              <Button
                variant="warning"
                onClick={() => setShowConfirmModal(true)}
              >
                Conferma
              </Button>
              <Button variant="info" onClick={() => setShowFormModal(true)}>
                Form Modal
              </Button>
              <Button
                variant="success"
                onClick={() => setShowCharacterModal(true)}
              >
                Character Modal
              </Button>
              <DangerButton onClick={() => setShowDeleteModal(true)}>
                Delete Confirm
              </DangerButton>
              <Button variant="ghost" onClick={() => setShowImageModal(true)}>
                Image Preview
              </Button>
            </div>
          </DemoGroup>
        </ComponentSection>

        {/* All Modals */}

        {/* Basic Modal */}
        <Modal
          isOpen={showBasicModal}
          onClose={() => setShowBasicModal(false)}
          title="Modal di Esempio"
          size="md"
          description="Questo è un modal base con contenuto personalizzabile"
        >
          <div className="space-y-4">
            <p className="text-secondary">
              Questo modal dimostra le funzionalità base: backdrop blur, focus
              trap, chiusura con ESC e click esterno, gestione accessibilità.
            </p>

            <div className="space-y-3">
              <Input label="Campo di prova" placeholder="Prova a scrivere..." />
              <TextArea
                label="Note"
                placeholder="Aggiungi delle note..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-primary">
              <CancelButton onClick={() => setShowBasicModal(false)}>
                Annulla
              </CancelButton>
              <SaveButton onClick={() => setShowBasicModal(false)}>
                Salva
              </SaveButton>
            </div>
          </div>
        </Modal>

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            console.log("Azione confermata!");
          }}
          title="Conferma Azione"
          message="Sei sicuro di voler procedere con questa azione? Non sarà possibile annullarla."
          confirmText="Sì, Procedi"
          cancelText="Annulla"
          variant="warning"
        />

        {/* Form Modal */}
        <FormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title="Nuovo Elemento"
          size="lg"
          description="Compila il form per creare un nuovo elemento"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Nome" placeholder="Nome elemento..." required />
              <Input label="Tipo" placeholder="Tipo elemento..." />
            </div>

            <TextArea
              label="Descrizione"
              placeholder="Descrizione dettagliata..."
              minRows={4}
              showCharacterCount
              maxLength={500}
            />

            <div className="flex gap-3 justify-end pt-4 border-t border-primary">
              <CancelButton onClick={() => setShowFormModal(false)}>
                Annulla
              </CancelButton>
              <CreateButton onClick={() => setShowFormModal(false)}>
                Crea Elemento
              </CreateButton>
            </div>
          </div>
        </FormModal>

        {/* Character Form Modal */}
        <CharacterFormModal
          isOpen={showCharacterModal}
          onClose={() => setShowCharacterModal(false)}
          mode="create"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Nome Personaggio"
                placeholder="Inserisci il nome..."
                required
              />
              <Input label="Razza" placeholder="Es: Umano, Elfo..." />
              <Input label="Classe" placeholder="Es: Guerriero, Mago..." />
              <Input
                label="Livello"
                type="number"
                placeholder="1"
                min="1"
                max="20"
              />
            </div>

            <TextArea
              label="Background"
              placeholder="Racconta la storia del personaggio..."
              minRows={4}
            />

            <div className="flex gap-3 justify-end pt-4 border-t border-primary">
              <CancelButton onClick={() => setShowCharacterModal(false)}>
                Annulla
              </CancelButton>
              <CreateButton onClick={() => setShowCharacterModal(false)}>
                Crea Personaggio
              </CreateButton>
            </div>
          </div>
        </CharacterFormModal>

        {/* Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            console.log("Elemento eliminato!");
          }}
          itemName="Aranel Moonwhisper"
          itemType="personaggio"
        />

        {/* Image Preview Modal */}
        <ImagePreviewModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          imageUrl="/api/placeholder/800/600"
          imageAlt="Anteprima immagine"
          title="Mappa del Dungeon"
        />
      </div>
    </div>
  );
};

export default DemoComponentsPage;
