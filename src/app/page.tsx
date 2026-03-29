import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dice5, Users, Trophy, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Dice5 className="h-16 w-16 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Ma Ludothèque
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Organisez votre collection de jeux de société, suivez vos parties et
          découvrez de nouveaux jeux à partager entre amis.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg">Commencer</Button>
          <Button size="lg" variant="outline">
            En savoir plus
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                <Badge variant="secondary">Collection</Badge>
              </div>
              <CardTitle>Gérez vos jeux</CardTitle>
              <CardDescription>
                Cataloguez tous vos jeux de société avec photos, règles et notes
                personnelles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ajoutez facilement vos jeux, triez par catégorie, nombre de
                joueurs ou durée de partie.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-secondary" />
                <Badge variant="secondary">Parties</Badge>
              </div>
              <CardTitle>Suivez vos parties</CardTitle>
              <CardDescription>
                Enregistrez chaque partie jouée avec les scores et les
                participants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gardez un historique complet de vos soirées jeux et retrouvez
                vos meilleurs moments.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-secondary" />
                <Badge variant="secondary">Statistiques</Badge>
              </div>
              <CardTitle>Analysez vos stats</CardTitle>
              <CardDescription>
                Découvrez vos jeux préférés, vos taux de victoire et vos
                tendances.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Des graphiques clairs pour comprendre vos habitudes ludiques et
                progresser.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
