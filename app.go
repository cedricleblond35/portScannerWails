package main

import (
	"context"
	"fmt"
	"log"

	"github.com/cedricleblond35/portScannerWails/cmd"
)

// App struct for Wails
type App struct {
	ctx     context.Context
	scanner *cmd.PortScanner
}

// NewApp creates a new App instance
func NewApp() *App {
	return &App{}
}

// WailsInit initializes the app
func (a *App) WailsInit(ctx context.Context) {
	a.ctx = ctx
}

// StartScan initializes and starts a scan
func (a *App) StartScan(host string, startPort, endPort int, protocol string) ([]string, error) {
	if startPort < 1 || endPort > 65535 || startPort > endPort {
		return nil, fmt.Errorf("invalid port range: must be between 1 and 65535, with start <= end")
	}
	a.scanner = cmd.NewPortScanner(host, startPort, endPort, protocol)
	results := a.scanner.Scan()
	return results, nil
}

// GetProgress returns the current scanning progress
func (a *App) GetProgress() float64 {
	if a.scanner == nil {
		return 0
	}
	return a.scanner.Progress()
}

// StopScan stops the current scan
func (a *App) StopScan() {
	if a.scanner != nil {
		a.scanner.Stop()
	}
}

// LogError logs an error to a file
func (a *App) LogError(err string) {
	log.Printf("Error: %s", err)
	// Ici, vous pouvez ajouter une écriture dans un fichier de log si besoin
}
