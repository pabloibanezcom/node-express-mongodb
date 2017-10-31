module.exports = class AdvancedExampleClass {
    get virtualProperty() {
        return `#${this.property45}`;
    }

    // `getvirtualProperty()` becomes a document method
    getvirtualProperty() {
        return `#${this.property45}`;
    }

    // `findByFullName()` becomes a static
    static findByVirtualProperty(name) {
        return 'static result';
    }
}

