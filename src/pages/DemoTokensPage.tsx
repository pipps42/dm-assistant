import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/shared/components/ui/Card";
import { SecondaryButton } from "@/shared/components/ui/Button";

const DemoTokensPage: React.FC = () => {
  const spacingTokens = [
    { name: "--space-1", value: "4px", usage: "Micro gaps" },
    { name: "--space-2", value: "8px", usage: "Small gaps" },
    { name: "--space-3", value: "12px", usage: "Base small" },
    { name: "--space-4", value: "16px", usage: "Base medium" },
    { name: "--space-6", value: "24px", usage: "Section spacing" },
    { name: "--space-8", value: "32px", usage: "Layout spacing" },
  ];

  const radiusTokens = [
    { name: "--radius-base", value: "4px" },
    { name: "--radius-md", value: "6px" },
    { name: "--radius-lg", value: "8px" },
    { name: "--radius-xl", value: "12px" },
    { name: "--radius-full", value: "9999px" },
  ];

  const fontSizes = [
    { name: "--font-size-xs", value: "12px", example: "Extra Small Text" },
    { name: "--font-size-sm", value: "14px", example: "Small Text" },
    { name: "--font-size-base", value: "16px", example: "Base Text" },
    { name: "--font-size-lg", value: "18px", example: "Large Text" },
    { name: "--font-size-xl", value: "20px", example: "Extra Large Text" },
    { name: "--font-size-2xl", value: "24px", example: "Heading Text" },
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="surface-primary border-b border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Design Tokens</h1>
              <p className="text-secondary mt-2">
                Tutti i token del design system: colori, spacing, typography e
                altro
              </p>
            </div>
            <Link to="/">
              <SecondaryButton>← Torna alla Home</SecondaryButton>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-16">
        {/* Color Tokens */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Color Tokens
          </h2>

          {/* Primary Colors */}
          <div className="mb-12">
            <h3 className="text-lg font-medium text-secondary mb-6">
              Primary Palette
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <Card key={shade} size="sm">
                  <div
                    className="h-16 rounded-lg mb-3"
                    style={{ backgroundColor: `var(--color-primary-${shade})` }}
                  ></div>
                  <div className="text-sm">
                    <div className="font-mono text-xs text-tertiary">
                      --color-primary-{shade}
                    </div>
                    <div className="font-medium">Primary {shade}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="mb-12">
            <h3 className="text-lg font-medium text-secondary mb-6">
              Semantic Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Success */}
              <Card>
                <h4 className="font-medium mb-4">Success</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-success-500)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-success-500
                      </div>
                      <div>Main</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-success-100)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-success-100
                      </div>
                      <div>Light</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Warning */}
              <Card>
                <h4 className="font-medium mb-4">Warning</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-warning-500)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-warning-500
                      </div>
                      <div>Main</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-warning-100)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-warning-100
                      </div>
                      <div>Light</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Error */}
              <Card>
                <h4 className="font-medium mb-4">Error</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-error-500)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-error-500
                      </div>
                      <div>Main</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-error-100)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-error-100
                      </div>
                      <div>Light</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Info */}
              <Card>
                <h4 className="font-medium mb-4">Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-info-500)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-info-500
                      </div>
                      <div>Main</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: "var(--color-info-100)" }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-mono text-xs text-tertiary">
                        --color-info-100
                      </div>
                      <div>Light</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Surface & Text Colors */}
          <div>
            <h3 className="text-lg font-medium text-secondary mb-6">
              Surface & Text
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h4 className="font-medium mb-4">Surface Colors</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded surface-primary border border-primary">
                    <span className="font-mono text-sm">--surface-primary</span>
                  </div>
                  <div className="p-3 rounded surface-secondary border border-primary">
                    <span className="font-mono text-sm">
                      --surface-secondary
                    </span>
                  </div>
                  <div className="p-3 rounded surface-tertiary border border-primary">
                    <span className="font-mono text-sm">
                      --surface-tertiary
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="font-medium mb-4">Text Colors</h4>
                <div className="space-y-3">
                  <div className="text-primary">
                    <span className="font-mono text-sm">--text-primary</span> -
                    Testo principale
                  </div>
                  <div className="text-secondary">
                    <span className="font-mono text-sm">--text-secondary</span>{" "}
                    - Testo secondario
                  </div>
                  <div className="text-tertiary">
                    <span className="font-mono text-sm">--text-tertiary</span> -
                    Testo terziario
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Spacing Tokens */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Spacing Tokens
          </h2>
          <Card>
            <div className="space-y-4">
              {spacingTokens.map((token) => (
                <div key={token.name} className="flex items-center gap-6">
                  <div className="w-32 font-mono text-sm text-tertiary">
                    {token.name}
                  </div>
                  <div className="w-16 text-sm">{token.value}</div>
                  <div
                    className="bg-primary-500 rounded"
                    style={{
                      width: token.value,
                      height: "16px",
                    }}
                  ></div>
                  <div className="text-sm text-secondary">{token.usage}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Typography Tokens */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Typography Tokens
          </h2>

          {/* Font Sizes */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-secondary mb-6">
              Font Sizes
            </h3>
            <Card>
              <div className="space-y-6">
                {fontSizes.map((size) => (
                  <div key={size.name} className="flex items-center gap-6">
                    <div className="w-40 font-mono text-sm text-tertiary">
                      {size.name}
                    </div>
                    <div className="w-16 text-sm">{size.value}</div>
                    <div
                      className="flex-1 text-primary"
                      style={{ fontSize: size.value }}
                    >
                      {size.example}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Font Weights */}
          <div>
            <h3 className="text-lg font-medium text-secondary mb-6">
              Font Weights
            </h3>
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="w-40 font-mono text-sm text-tertiary">
                    --font-weight-normal
                  </div>
                  <div className="w-16 text-sm">400</div>
                  <div className="flex-1" style={{ fontWeight: 400 }}>
                    Normal Weight Text
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-40 font-mono text-sm text-tertiary">
                    --font-weight-medium
                  </div>
                  <div className="w-16 text-sm">500</div>
                  <div className="flex-1" style={{ fontWeight: 500 }}>
                    Medium Weight Text
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-40 font-mono text-sm text-tertiary">
                    --font-weight-semibold
                  </div>
                  <div className="w-16 text-sm">600</div>
                  <div className="flex-1" style={{ fontWeight: 600 }}>
                    Semibold Weight Text
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-40 font-mono text-sm text-tertiary">
                    --font-weight-bold
                  </div>
                  <div className="w-16 text-sm">700</div>
                  <div className="flex-1" style={{ fontWeight: 700 }}>
                    Bold Weight Text
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Border Radius */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Border Radius
          </h2>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {radiusTokens.map((radius) => (
                <div key={radius.name} className="text-center">
                  <div
                    className="w-16 h-16 bg-primary-500 mx-auto mb-3"
                    style={{ borderRadius: radius.value }}
                  ></div>
                  <div className="font-mono text-sm text-tertiary">
                    {radius.name}
                  </div>
                  <div className="text-sm">{radius.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Shadows */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-8">
            Shadow Tokens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["sm", "md", "lg", "xl", "2xl"].map((shadow) => (
              <Card key={shadow} variant="elevated">
                <div
                  className="h-24 surface-primary rounded-lg mb-4"
                  style={{ boxShadow: `var(--shadow-${shadow})` }}
                ></div>
                <div className="text-center">
                  <div className="font-mono text-sm text-tertiary">
                    --shadow-{shadow}
                  </div>
                  <div className="text-sm capitalize">{shadow} Shadow</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DemoTokensPage;
