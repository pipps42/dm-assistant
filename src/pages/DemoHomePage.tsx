import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  CreateButton,
  EditButton,
  DeleteButton,
} from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Fields/Input";
import { TextArea } from "@/shared/components/ui/Fields/TextArea";
import {
  Card,
  FeatureCard,
  StatsCard,
  ToolCard,
} from "@/shared/components/ui/Card";
import { Modal, ConfirmModal } from "@/shared/components/ui/Modal";

const DemoHomePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="surface-primary border-b border-primary">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            DM Assistant Design System
          </h1>
          <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
            Un sistema di componenti UI modulare e riutilizzabile per creare
            strumenti D&D con consistenza, velocità e qualità professionale.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <PrimaryButton size="lg">Esplora Componenti</PrimaryButton>
            <SecondaryButton size="lg">Design Tokens</SecondaryButton>
          </div>
        </div>
      </section>

      {/* Color Palette Preview */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-primary mb-8">
          Sistema Colori
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Primary Colors */}
          <div className="space-y-3">
            <h3 className="font-medium text-secondary">Primary</h3>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg"
                style={{ backgroundColor: "var(--color-primary-500)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-primary-400)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-primary-600)" }}
              ></div>
            </div>
          </div>

          {/* Success Colors */}
          <div className="space-y-3">
            <h3 className="font-medium text-secondary">Success</h3>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg"
                style={{ backgroundColor: "var(--color-success-500)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-success-100)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-success-700)" }}
              ></div>
            </div>
          </div>

          {/* Warning Colors */}
          <div className="space-y-3">
            <h3 className="font-medium text-secondary">Warning</h3>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg"
                style={{ backgroundColor: "var(--color-warning-500)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-warning-100)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-warning-700)" }}
              ></div>
            </div>
          </div>

          {/* Error Colors */}
          <div className="space-y-3">
            <h3 className="font-medium text-secondary">Error</h3>
            <div className="space-y-2">
              <div
                className="h-12 rounded-lg"
                style={{ backgroundColor: "var(--color-error-500)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-error-100)" }}
              ></div>
              <div
                className="h-8 rounded"
                style={{ backgroundColor: "var(--color-error-700)" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Button Showcase */}
      <section className="surface-secondary">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Componenti Button
          </h2>

          {/* Basic Variants */}
          <div className="mb-12">
            <h3 className="text-lg font-medium text-secondary mb-6">
              Varianti Base
            </h3>
            <div className="flex gap-4 flex-wrap">
              <PrimaryButton>Primary</PrimaryButton>
              <SecondaryButton>Secondary</SecondaryButton>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <DangerButton>Danger</DangerButton>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-12">
            <h3 className="text-lg font-medium text-secondary mb-6">
              Dimensioni
            </h3>
            <div className="flex gap-4 items-center flex-wrap">
              <PrimaryButton size="sm">Small</PrimaryButton>
              <PrimaryButton size="md">Medium</PrimaryButton>
              <PrimaryButton size="lg">Large</PrimaryButton>
            </div>
          </div>

          {/* D&D Preset Buttons */}
          <div className="mb-12">
            <h3 className="text-lg font-medium text-secondary mb-6">
              Preset D&D
            </h3>
            <div className="flex gap-4 flex-wrap">
              <CreateButton>Crea</CreateButton>
              <EditButton>Modifica</EditButton>
              <DeleteButton>Elimina</DeleteButton>
              <Button variant="utility" leftIcon={<span>🎲</span>}>
                Lancia Dadi
              </Button>
              <Button variant="combat" leftIcon={<span>⚔️</span>}>
                Combattimento
              </Button>
            </div>
          </div>

          {/* States */}
          <div>
            <h3 className="text-lg font-medium text-secondary mb-6">Stati</h3>
            <div className="flex gap-4 flex-wrap">
              <PrimaryButton>Normale</PrimaryButton>
              <PrimaryButton loading>Caricamento</PrimaryButton>
              <PrimaryButton disabled>Disabilitato</PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Card Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-primary mb-8">
          Componenti Card
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature Card */}
          <FeatureCard
            title="Combat Tracker"
            description="Gestisci l'iniziativa, HP e condizioni durante il combattimento"
            icon={<span className="text-2xl">⚔️</span>}
            status="new"
            action={<PrimaryButton size="sm">Apri Tool</PrimaryButton>}
          />

          {/* Stats Card */}
          <StatsCard
            title="Sessioni Attive"
            value="12"
            subtitle="Ultimo mese"
            icon={<span className="text-xl">📊</span>}
            trend="up"
            trendValue="+15%"
          />

          {/* Tool Card */}
          <ToolCard
            name="Bestiario"
            description="Gestisci mostri, stat block e calcola il Challenge Rating"
            icon={<span className="text-2xl">🐉</span>}
            onClick={() => console.log("Bestiario clicked")}
            category="combat"
          />
        </div>
      </section>

      {/* Form Components */}
      <section className="surface-secondary">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Componenti Form
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-6">
              <div>
                <Input
                  label="Nome Personaggio"
                  placeholder="Inserisci il nome..."
                  helperText="Il nome del tuo personaggio"
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  state="error"
                  errorText="Email non valida"
                  defaultValue="invalid-email"
                />
              </div>

              <div>
                <Input
                  label="Punti Esperienza"
                  type="number"
                  state="success"
                  rightIcon={<span>✓</span>}
                  defaultValue="1250"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <TextArea
                  label="Background"
                  placeholder="Racconta la storia del tuo personaggio..."
                  helperText="Descrivi il passato e la personalità"
                  minRows={4}
                />
              </div>

              <div>
                <TextArea
                  label="Note Sessione"
                  variant="filled"
                  showCharacterCount
                  maxLength={500}
                  defaultValue="Il party ha esplorato la caverna misteriosa e scoperto un antico artefatto..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-primary mb-8">
          Componenti Modal
        </h2>

        <div className="flex gap-4 flex-wrap">
          <SecondaryButton onClick={() => setShowModal(true)}>
            Mostra Modal Semplice
          </SecondaryButton>
          <DangerButton onClick={() => setShowConfirmModal(true)}>
            Mostra Conferma
          </DangerButton>
        </div>

        {/* Simple Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Modal di Esempio"
          description="Questo è un esempio di modal con contenuto semplice"
        >
          <div className="space-y-4">
            <p className="text-secondary">
              Questo modal dimostra le funzionalità base: backdrop blur, focus
              trap, chiusura con ESC e click esterno.
            </p>

            <div className="space-y-3">
              <Input label="Campo di prova" placeholder="Prova a scrivere..." />
              <TextArea
                label="Area di testo"
                placeholder="Contenuto..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <SecondaryButton onClick={() => setShowModal(false)}>
                Annulla
              </SecondaryButton>
              <PrimaryButton onClick={() => setShowModal(false)}>
                Conferma
              </PrimaryButton>
            </div>
          </div>
        </Modal>

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            console.log("Confermato!");
          }}
          title="Conferma Azione"
          message="Sei sicuro di voler procedere? Questa azione non può essere annullata."
          confirmText="Sì, Procedi"
          cancelText="Annulla"
          variant="danger"
        />
      </section>

      {/* Navigation to Full Demos */}
      <section className="surface-elevated border-t border-primary">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-primary mb-8 text-center">
            Esplora di Più
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="interactive" size="lg" clickable>
              <div className="text-center space-y-4">
                <div className="text-3xl">🎨</div>
                <h3 className="text-xl font-semibold">Design Tokens</h3>
                <p className="text-secondary">
                  Esplora tutti i token del design system: colori, spacing,
                  typography e altro.
                </p>
                <Link to="/demo/tokens">
                  <PrimaryButton size="sm">Esplora Tokens</PrimaryButton>
                </Link>
              </div>
            </Card>

            <Card variant="interactive" size="lg" clickable>
              <div className="text-center space-y-4">
                <div className="text-3xl">🧩</div>
                <h3 className="text-xl font-semibold">Tutti i Componenti</h3>
                <p className="text-secondary">
                  Vedi tutti i componenti con tutte le varianti, stati e
                  configurazioni.
                </p>
                <Link to="/demo/components">
                  <PrimaryButton size="sm">Vedi Componenti</PrimaryButton>
                </Link>
              </div>
            </Card>

            <Card variant="interactive" size="lg" clickable>
              <div className="text-center space-y-4">
                <div className="text-3xl">📝</div>
                <h3 className="text-xl font-semibold">Form Playground</h3>
                <p className="text-secondary">
                  Testa tutti i componenti form, validazione e interazioni
                  avanzate.
                </p>
                <Link to="/demo/forms">
                  <PrimaryButton size="sm">Prova Forms</PrimaryButton>
                </Link>
              </div>
            </Card>

            <Card variant="interactive" size="lg" clickable>
              <div className="text-center space-y-4">
                <div className="text-3xl">📊</div>
                <h3 className="text-xl font-semibold">Table Components</h3>
                <p className="text-secondary">
                  Esplora tabelle con sorting, pagination, selezione e tutte le
                  varianti.
                </p>
                <Link to="/demo/tables">
                  <PrimaryButton size="sm">Vedi Tabelle</PrimaryButton>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="surface-tertiary border-t border-secondary">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-tertiary">
            DM Assistant Design System - Versione 0.1.0
          </p>
          <p className="text-tertiary text-sm mt-2">
            Costruito con amore per i Dungeon Master ⚔️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DemoHomePage;
