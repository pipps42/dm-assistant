import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  PrimaryButton,
  SecondaryButton,
  CreateButton,
  SaveButton,
  CancelButton,
  DeleteButton,
} from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { TextArea } from "@/shared/components/ui/TextArea";
import {
  Select,
  ClassSelect,
  RaceSelect,
  AlignmentSelect,
} from "@/shared/components/ui/Select";
import { Checkbox, Radio, RadioGroup } from "@/shared/components/ui";
import { Card } from "@/shared/components/ui/Card";

const DemoFormsPage: React.FC = () => {
  // Form states
  const [basicFormData, setBasicFormData] = useState({
    name: "",
    email: "",
    description: "",
  });

  const [characterFormData, setCharacterFormData] = useState({
    name: "",
    race: "",
    class: "",
    level: 1,
    background: "",
    alignment: "",
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const [campaignFormData, setCampaignFormData] = useState({
    title: "",
    description: "",
    setting: "",
    playerCount: 4,
    difficulty: "medium",
    startingLevel: 1,
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Select demo states
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [selectedAlignment, setSelectedAlignment] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<
    (string | number)[]
  >([]);
  const [selectedSkills, setSelectedSkills] = useState<(string | number)[]>([]);
  const [customSelect, setCustomSelect] = useState<string>("");

  // Select change handlers to match component signature
  const handleClassChange = (value: string | number | (string | number)[]) => {
    setSelectedClass(value as string);
  };

  const handleRaceChange = (value: string | number | (string | number)[]) => {
    setSelectedRace(value as string);
  };

  const handleAlignmentChange = (
    value: string | number | (string | number)[]
  ) => {
    setSelectedAlignment(value as string);
  };

  const handleLanguagesChange = (
    value: string | number | (string | number)[]
  ) => {
    setSelectedLanguages(Array.isArray(value) ? value : [value]);
  };

  const handleSkillsChange = (value: string | number | (string | number)[]) => {
    setSelectedSkills(Array.isArray(value) ? value : [value]);
  };

  const handleCustomSelectChange = (
    value: string | number | (string | number)[]
  ) => {
    setCustomSelect(value as string);
  };

  // Select options data
  const languageOptions = [
    { value: "common", label: "Comune" },
    { value: "elvish", label: "Elfico" },
    { value: "dwarvish", label: "Nanico" },
    { value: "halfling", label: "Halfling" },
    { value: "orc", label: "Orchesco" },
    { value: "draconic", label: "Draconico" },
    { value: "celestial", label: "Celestiale" },
    { value: "infernal", label: "Infernale" },
    { value: "abyssal", label: "Abissale" },
    { value: "sylvan", label: "Silvano" },
  ];

  const skillOptions = [
    { value: "acrobatics", label: "Acrobazia (Des)" },
    { value: "athletics", label: "Atletica (For)" },
    { value: "deception", label: "Inganno (Car)" },
    { value: "history", label: "Storia (Int)" },
    { value: "insight", label: "Intuizione (Sag)" },
    { value: "intimidation", label: "Intimidire (Car)" },
    { value: "investigation", label: "Indagare (Int)" },
    { value: "medicine", label: "Medicina (Sag)" },
    { value: "nature", label: "Natura (Int)" },
    { value: "perception", label: "Percezione (Sag)" },
    { value: "performance", label: "Intrattenere (Car)" },
    { value: "persuasion", label: "Persuasione (Car)" },
    { value: "religion", label: "Religione (Int)" },
    { value: "sleight", label: "Rapidità di Mano (Des)" },
    { value: "stealth", label: "Furtività (Des)" },
    { value: "survival", label: "Sopravvivenza (Sag)" },
  ];

  const customOptions = [
    { value: "option1", label: "Prima Opzione" },
    { value: "option2", label: "Seconda Opzione" },
    {
      value: "option3",
      label: "Terza Opzione con testo molto lungo che dovrebbe essere troncato",
    },
    { value: "option4", label: "Quarta Opzione" },
    { value: "option5", label: "Quinta Opzione" },
  ];

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return "Email è obbligatoria";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email non valida";
    return null;
  };

  const validateRequired = (
    value: string,
    fieldName: string
  ): string | null => {
    if (!value.trim()) return `${fieldName} è obbligatorio`;
    return null;
  };

  const validateLevel = (level: number): string | null => {
    if (level < 1 || level > 20) return "Il livello deve essere tra 1 e 20";
    return null;
  };

  // Form handlers
  const handleBasicFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Simulate validation
      const errors: Record<string, string> = {};

      const nameError = validateRequired(basicFormData.name, "Nome");
      if (nameError) errors.name = nameError;

      const emailError = validateEmail(basicFormData.email);
      if (emailError) errors.email = emailError;

      setValidationErrors(errors);

      if (Object.keys(errors).length === 0) {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Form submitted:", basicFormData);
        alert("Form inviato con successo!");
      }

      setIsSubmitting(false);
    },
    [basicFormData]
  );

  const handleCharacterFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const errors: Record<string, string> = {};

      const nameError = validateRequired(characterFormData.name, "Nome");
      if (nameError) errors.characterName = nameError;

      const levelError = validateLevel(characterFormData.level);
      if (levelError) errors.level = levelError;

      setValidationErrors(errors);

      if (Object.keys(errors).length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Character created:", characterFormData);
        alert("Personaggio creato con successo!");
      }

      setIsSubmitting(false);
    },
    [characterFormData]
  );

  const FormSection: React.FC<{
    title: string;
    children: React.ReactNode;
    description?: string;
  }> = ({ title, children, description }) => (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">{title}</h2>
        {description && <p className="text-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );

  const DemoCard: React.FC<{
    title: string;
    children: React.ReactNode;
    description?: string;
  }> = ({ title, children, description }) => (
    <Card className="p-6 mb-8">
      <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-secondary mb-6">{description}</p>
      )}
      {children}
    </Card>
  );

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="surface-primary border-b border-primary sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Form Playground
              </h1>
              <p className="text-secondary mt-2">
                Testa componenti form, validazione e interazioni avanzate
              </p>
            </div>
            <Link to="/">
              <SecondaryButton>← Torna alla Home</SecondaryButton>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Basic Form Example */}
        <FormSection
          title="Form Base con Validazione"
          description="Esempio di form semplice con validazione real-time e gestione errori"
        >
          <DemoCard
            title="Form Contatto"
            description="Form con validazione email e campi obbligatori"
          >
            <form onSubmit={handleBasicFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Nome"
                  placeholder="Il tuo nome..."
                  value={basicFormData.name}
                  onChange={(e) =>
                    setBasicFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  state={validationErrors.name ? "error" : "default"}
                  errorText={validationErrors.name}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="esempio@email.com"
                  value={basicFormData.email}
                  onChange={(e) =>
                    setBasicFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  state={validationErrors.email ? "error" : "default"}
                  errorText={validationErrors.email}
                  leftIcon={<span>📧</span>}
                  required
                />
              </div>

              <TextArea
                label="Descrizione"
                placeholder="Descrivi la tua richiesta..."
                value={basicFormData.description}
                onChange={(e) =>
                  setBasicFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                minRows={4}
                showCharacterCount
                maxLength={500}
              />

              <div className="flex gap-4">
                <PrimaryButton type="submit" loading={isSubmitting}>
                  {isSubmitting ? "Invio in corso..." : "Invia Form"}
                </PrimaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setBasicFormData({ name: "", email: "", description: "" });
                    setValidationErrors({});
                  }}
                >
                  Reset
                </SecondaryButton>
              </div>
            </form>
          </DemoCard>
        </FormSection>

        {/* Select Components */}
        <FormSection
          title="Select Components"
          description="Dropdown e select per scelte multiple con ricerca, multi-selezione e preset D&D"
        >
          {/* Basic Select */}
          <DemoCard
            title="Select Base"
            description="Select con opzioni base e varianti stilistiche"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <Select
                label="Select Outlined"
                placeholder="Seleziona un'opzione..."
                options={customOptions}
                value={customSelect}
                onChange={handleCustomSelectChange}
                variant="outlined"
              />

              <Select
                label="Select Filled"
                placeholder="Stile filled..."
                options={customOptions.slice(0, 3)}
                variant="filled"
              />

              <Select
                label="Select Ghost"
                placeholder="Stile ghost..."
                options={customOptions.slice(0, 3)}
                variant="ghost"
              />
            </div>
          </DemoCard>

          {/* Select with Search */}
          <DemoCard
            title="Select con Ricerca"
            description="Select con funzionalità di ricerca e filtro opzioni"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Select
                label="Linguaggi Conosciuti"
                placeholder="Cerca e seleziona linguaggi..."
                options={languageOptions}
                value={selectedLanguages}
                onChange={handleLanguagesChange}
                multiple
                searchable
                clearable
                leftIcon={<span>🗣️</span>}
                helperText="Puoi selezionare più linguaggi"
              />

              <Select
                label="Competenze"
                placeholder="Cerca competenze..."
                options={skillOptions}
                value={selectedSkills}
                onChange={handleSkillsChange}
                multiple
                searchable
                clearable
                searchPlaceholder="Cerca competenze..."
                leftIcon={<span>🎯</span>}
                maxHeight={200}
              />
            </div>
          </DemoCard>

          {/* D&D Preset Selects */}
          <DemoCard
            title="Select Preset D&D"
            description="Select predefiniti per elementi comuni di D&D"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <ClassSelect
                label="Classe"
                value={selectedClass}
                onChange={handleClassChange}
                placeholder="Seleziona classe..."
                required
              />

              <RaceSelect
                label="Razza"
                value={selectedRace}
                onChange={handleRaceChange}
                placeholder="Seleziona razza..."
                required
              />

              <AlignmentSelect
                label="Allineamento"
                value={selectedAlignment}
                onChange={handleAlignmentChange}
                placeholder="Seleziona allineamento..."
              />
            </div>

            {(selectedClass || selectedRace || selectedAlignment) && (
              <div className="mt-6 p-4 bg-surface-secondary rounded-lg">
                <h5 className="font-medium mb-3">Selezione Corrente:</h5>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Classe:</span>
                    <div className="font-medium">
                      {selectedClass || "Non selezionata"}
                    </div>
                  </div>
                  <div>
                    <span className="text-secondary">Razza:</span>
                    <div className="font-medium">
                      {selectedRace || "Non selezionata"}
                    </div>
                  </div>
                  <div>
                    <span className="text-secondary">Allineamento:</span>
                    <div className="font-medium">
                      {selectedAlignment || "Non selezionato"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DemoCard>

          {/* Select States */}
          <DemoCard
            title="Stati dei Select"
            description="Select in diversi stati: normale, errore, disabilitato, caricamento"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Select
                  label="Select Normale"
                  options={customOptions.slice(0, 3)}
                  placeholder="Stato normale"
                />

                <Select
                  label="Select con Errore"
                  options={customOptions.slice(0, 3)}
                  placeholder="Seleziona opzione"
                  state="error"
                  errorText="Questo campo è obbligatorio"
                />
              </div>

              <div className="space-y-4">
                <Select
                  label="Select Disabilitato"
                  options={customOptions.slice(0, 3)}
                  placeholder="Opzione non disponibile"
                  disabled
                />

                <Select
                  label="Select in Caricamento"
                  options={[]}
                  placeholder="Caricamento opzioni..."
                  loading
                />
              </div>
            </div>
          </DemoCard>

          {/* Advanced Select Features */}
          <DemoCard
            title="Funzionalità Avanzate"
            description="Select con tutte le funzionalità: multi-selezione, ricerca, icone, clearable"
          >
            <div className="space-y-6">
              <Select
                label="Select Completo"
                placeholder="Seleziona o cerca opzioni..."
                options={[
                  ...languageOptions.map((opt) => ({
                    ...opt,
                    group: "Linguaggi",
                  })),
                  ...skillOptions
                    .slice(0, 8)
                    .map((opt) => ({ ...opt, group: "Competenze" })),
                ]}
                multiple
                searchable
                clearable
                leftIcon={<span>🔍</span>}
                rightIcon={<span>⚡</span>}
                searchPlaceholder="Digita per cercare..."
                helperText="Questo select supporta ricerca, multi-selezione e raggruppamento"
                maxHeight={250}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <Select
                  label="Select con Successo"
                  options={customOptions.slice(0, 3)}
                  defaultValue="option1"
                  state="success"
                  rightIcon={<span>✓</span>}
                  helperText="Selezione valida"
                />

                <Select
                  label="Select con Warning"
                  options={customOptions.slice(0, 3)}
                  defaultValue="option3"
                  state="warning"
                  rightIcon={<span>⚠️</span>}
                  helperText="Controlla questa selezione"
                />
              </div>
            </div>
          </DemoCard>
        </FormSection>

        {/* Character Creation Form */}
        <FormSection
          title="Form D&D - Creazione Personaggio"
          description="Form complesso per la creazione di un personaggio D&D con validazione avanzata"
        >
          <DemoCard
            title="Nuovo Personaggio"
            description="Form con sezioni multiple e validazione specifica per D&D"
          >
            <form onSubmit={handleCharacterFormSubmit} className="space-y-8">
              {/* Basic Info Section */}
              <div>
                <h4 className="text-md font-medium text-primary mb-4 pb-2 border-b border-primary">
                  📝 Informazioni Base
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Nome Personaggio"
                    placeholder="Es: Aranel Moonwhisper"
                    value={characterFormData.name}
                    onChange={(e) =>
                      setCharacterFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    state={validationErrors.characterName ? "error" : "default"}
                    errorText={validationErrors.characterName}
                    required
                  />

                  <Input
                    label="Razza"
                    placeholder="Es: Elfo, Umano, Nano..."
                    value={characterFormData.race}
                    onChange={(e) =>
                      setCharacterFormData((prev) => ({
                        ...prev,
                        race: e.target.value,
                      }))
                    }
                  />

                  <Input
                    label="Classe"
                    placeholder="Es: Guerriero, Mago, Ladro..."
                    value={characterFormData.class}
                    onChange={(e) =>
                      setCharacterFormData((prev) => ({
                        ...prev,
                        class: e.target.value,
                      }))
                    }
                  />

                  <Input
                    label="Livello"
                    type="number"
                    min="1"
                    max="20"
                    value={characterFormData.level.toString()}
                    onChange={(e) =>
                      setCharacterFormData((prev) => ({
                        ...prev,
                        level: parseInt(e.target.value) || 1,
                      }))
                    }
                    state={validationErrors.level ? "error" : "default"}
                    errorText={validationErrors.level}
                    leftIcon={<span>⭐</span>}
                  />

                  <Input
                    label="Allineamento"
                    placeholder="Es: Caotico Buono"
                    value={characterFormData.alignment}
                    onChange={(e) =>
                      setCharacterFormData((prev) => ({
                        ...prev,
                        alignment: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Ability Scores Section */}
              <div>
                <h4 className="text-md font-medium text-primary mb-4 pb-2 border-b border-primary">
                  🎲 Punteggi Caratteristiche
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { key: "strength", label: "Forza", icon: "💪" },
                    { key: "dexterity", label: "Destrezza", icon: "🏃" },
                    { key: "constitution", label: "Costituzione", icon: "❤️" },
                    { key: "intelligence", label: "Intelligenza", icon: "🧠" },
                    { key: "wisdom", label: "Saggezza", icon: "👁️" },
                    { key: "charisma", label: "Carisma", icon: "✨" },
                  ].map((stat) => (
                    <Input
                      key={stat.key}
                      label={stat.label}
                      type="number"
                      min="3"
                      max="20"
                      value={characterFormData[
                        stat.key as keyof typeof characterFormData
                      ].toString()}
                      onChange={(e) =>
                        setCharacterFormData((prev) => ({
                          ...prev,
                          [stat.key]: parseInt(e.target.value) || 10,
                        }))
                      }
                      leftIcon={<span>{stat.icon}</span>}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              {/* Background Section */}
              <div>
                <h4 className="text-md font-medium text-primary mb-4 pb-2 border-b border-primary">
                  📚 Background
                </h4>
                <TextArea
                  label="Storia del Personaggio"
                  placeholder="Racconta la storia, personalità e motivazioni del tuo personaggio..."
                  value={characterFormData.background}
                  onChange={(e) =>
                    setCharacterFormData((prev) => ({
                      ...prev,
                      background: e.target.value,
                    }))
                  }
                  minRows={6}
                  showCharacterCount
                  maxLength={1000}
                  helperText="Descrizione dettagliata del background del personaggio"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-primary">
                <CreateButton type="submit" loading={isSubmitting}>
                  {isSubmitting ? "Creazione in corso..." : "Crea Personaggio"}
                </CreateButton>
                <CancelButton
                  type="button"
                  onClick={() => {
                    setCharacterFormData({
                      name: "",
                      race: "",
                      class: "",
                      level: 1,
                      background: "",
                      alignment: "",
                      strength: 10,
                      dexterity: 10,
                      constitution: 10,
                      intelligence: 10,
                      wisdom: 10,
                      charisma: 10,
                    });
                    setValidationErrors({});
                  }}
                >
                  Reset Form
                </CancelButton>
              </div>
            </form>
          </DemoCard>
        </FormSection>

        {/* Multi-Step Form */}
        <FormSection
          title="Form Multi-Step - Creazione Campagna"
          description="Esempio di wizard form con navigazione tra step e validazione progressiva"
        >
          <DemoCard
            title="Nuova Campagna D&D"
            description={`Step ${currentStep} di 3 - Crea una nuova campagna passo dopo passo`}
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${
                        currentStep >= step
                          ? "bg-primary-500 text-inverse"
                          : "bg-surface-secondary text-secondary border border-primary"
                      }
                    `}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`
                        w-12 h-0.5 
                        ${
                          currentStep > step
                            ? "bg-primary-500"
                            : "bg-border-primary"
                        }
                      `}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-primary">
                    Informazioni Base
                  </h4>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Titolo Campagna"
                      placeholder="Es: Curse of Strahd"
                      value={campaignFormData.title}
                      onChange={(e) =>
                        setCampaignFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />

                    <Input
                      label="Ambientazione"
                      placeholder="Es: Forgotten Realms"
                      value={campaignFormData.setting}
                      onChange={(e) =>
                        setCampaignFormData((prev) => ({
                          ...prev,
                          setting: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <TextArea
                    label="Descrizione"
                    placeholder="Descrivi l'ambientazione, la trama principale e l'atmosfera della campagna..."
                    value={campaignFormData.description}
                    onChange={(e) =>
                      setCampaignFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    minRows={4}
                    showCharacterCount
                    maxLength={800}
                  />
                </div>
              )}

              {/* Step 2: Game Settings */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-primary">
                    Impostazioni di Gioco
                  </h4>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Input
                      label="Numero Giocatori"
                      type="number"
                      min="2"
                      max="8"
                      value={campaignFormData.playerCount.toString()}
                      onChange={(e) =>
                        setCampaignFormData((prev) => ({
                          ...prev,
                          playerCount: parseInt(e.target.value) || 4,
                        }))
                      }
                      leftIcon={<span>👥</span>}
                    />

                    <Input
                      label="Livello Iniziale"
                      type="number"
                      min="1"
                      max="20"
                      value={campaignFormData.startingLevel.toString()}
                      onChange={(e) =>
                        setCampaignFormData((prev) => ({
                          ...prev,
                          startingLevel: parseInt(e.target.value) || 1,
                        }))
                      }
                      leftIcon={<span>⭐</span>}
                    />

                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Difficoltà
                      </label>
                      <select
                        className="dm-input w-full"
                        value={campaignFormData.difficulty}
                        onChange={(e) =>
                          setCampaignFormData((prev) => ({
                            ...prev,
                            difficulty: e.target.value,
                          }))
                        }
                      >
                        <option value="easy">Facile</option>
                        <option value="medium">Normale</option>
                        <option value="hard">Difficile</option>
                        <option value="deadly">Mortale</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card variant="outlined" className="p-4">
                      <h5 className="font-medium mb-3">
                        ⚔️ Regole Combattimento
                      </h5>
                      <div className="space-y-2 text-sm">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            defaultChecked
                          />
                          <span>Flanking Rules</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span>Critical Hit Tables</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            defaultChecked
                          />
                          <span>Death Saving Throws</span>
                        </label>
                      </div>
                    </Card>

                    <Card variant="outlined" className="p-4">
                      <h5 className="font-medium mb-3">🎲 Regole Opzionali</h5>
                      <div className="space-y-2 text-sm">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span>Feats</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            defaultChecked
                          />
                          <span>Multiclassing</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span>Variant Human</span>
                        </label>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Step 3: Final Notes */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-primary">
                    Note Finali
                  </h4>

                  <TextArea
                    label="Note del DM"
                    placeholder="Aggiungi note personali, regole della casa, informazioni sui giocatori, idee per quest secondarie..."
                    value={campaignFormData.notes}
                    onChange={(e) =>
                      setCampaignFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    minRows={6}
                    showCharacterCount
                    maxLength={1500}
                  />

                  <Card variant="elevated" className="p-6">
                    <h5 className="font-medium mb-4">📋 Riepilogo Campagna</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Titolo:</span>
                        <span className="text-primary">
                          {campaignFormData.title || "Non specificato"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Ambientazione:</span>
                        <span className="text-primary">
                          {campaignFormData.setting || "Non specificata"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Giocatori:</span>
                        <span className="text-primary">
                          {campaignFormData.playerCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">
                          Livello Iniziale:
                        </span>
                        <span className="text-primary">
                          {campaignFormData.startingLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Difficoltà:</span>
                        <span className="text-primary capitalize">
                          {campaignFormData.difficulty}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t border-primary">
                <div>
                  {currentStep > 1 && (
                    <SecondaryButton
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      ← Indietro
                    </SecondaryButton>
                  )}
                </div>

                <div className="flex gap-3">
                  {currentStep < 3 ? (
                    <PrimaryButton
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Avanti →
                    </PrimaryButton>
                  ) : (
                    <CreateButton
                      type="button"
                      onClick={() => {
                        console.log("Campaign created:", campaignFormData);
                        alert("Campagna creata con successo!");
                      }}
                    >
                      🎲 Crea Campagna
                    </CreateButton>
                  )}
                </div>
              </div>
            </form>
          </DemoCard>
        </FormSection>

        {/* Quick Form Examples */}
        <FormSection
          title="Quick Forms"
          description="Esempi di form compatti per azioni rapide"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Add NPC */}
            <DemoCard
              title="Quick Add NPC"
              description="Form rapido per aggiungere un NPC"
            >
              <div className="space-y-4">
                <Input
                  label="Nome NPC"
                  placeholder="Es: Elara la Locandiera"
                  size="sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Razza" placeholder="Umana" size="sm" />
                  <Input label="Ruolo" placeholder="Locandiera" size="sm" />
                </div>
                <TextArea placeholder="Note rapide..." minRows={2} size="sm" />
                <div className="flex gap-2">
                  <CreateButton size="sm">Aggiungi</CreateButton>
                  <CancelButton size="sm">Reset</CancelButton>
                </div>
              </div>
            </DemoCard>

            {/* Quick Dice Roll */}
            <DemoCard
              title="Custom Dice Roll"
              description="Form per tiri di dado personalizzati"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Dadi" placeholder="2" size="sm" type="number" />
                  <Input
                    label="Facce"
                    placeholder="20"
                    size="sm"
                    type="number"
                  />
                  <Input label="Mod" placeholder="+3" size="sm" />
                </div>
                <TextArea
                  placeholder="Descrizione del tiro..."
                  minRows={2}
                  size="sm"
                />
                <div className="flex gap-2">
                  <PrimaryButton size="sm" leftIcon={<span>🎲</span>}>
                    Lancia!
                  </PrimaryButton>
                  <SecondaryButton size="sm">Reset</SecondaryButton>
                </div>
              </div>
            </DemoCard>
          </div>
        </FormSection>
      </div>
    </div>
  );
};

export default DemoFormsPage;
